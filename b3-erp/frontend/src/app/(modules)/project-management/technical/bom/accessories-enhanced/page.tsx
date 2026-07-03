'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Save,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Search,
  Edit2,
  Copy,
  FileText,
  AlertCircle,
  Download,
  Upload,
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
  category: {
    title: 'Category',
    content: 'Select the appropriate category for grouping. This helps in procurement and cost tracking.',
  },
  brand: {
    title: 'Brand Preference',
    content: 'Specify preferred brands or "Any" for flexibility. This affects pricing and lead times.',
  },
  leadTime: {
    title: 'Lead Time',
    content: 'Expected days for procurement. Items with longer lead times should be ordered early.',
  },
  stockCheck: {
    title: 'Stock Status',
    content: 'Green = In stock, Yellow = Low stock, Red = Out of stock. Affects procurement priority.',
  },
};

// Types
interface AccessoryItem {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  brand: string;
  unitPrice: number;
  totalPrice: number;
  leadTime: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  notes: string;
  isEditing?: boolean;
}

interface FormData {
  project: string;
  projectName: string;
  version: string;
  items: AccessoryItem[];
  notes: string;
}

const STEPS = [
  { id: 'project', label: 'Project', description: 'Select project' },
  { id: 'items', label: 'BOM Items', description: 'Add accessories' },
  { id: 'review', label: 'Review', description: 'Verify and submit' },
];

const CATEGORIES = [
  {
    name: 'Hinges',
    subcategories: ['Soft Close', 'Standard', 'Concealed', 'Pivot'],
    items: ['Soft Close Hinge 110°', 'Standard Hinge 165°', 'Concealed Hinge', 'Corner Cabinet Hinge'],
  },
  {
    name: 'Handles',
    subcategories: ['Bar', 'Knob', 'Pull', 'Profile'],
    items: ['Bar Handle 128mm', 'Bar Handle 160mm', 'Round Knob', 'Square Knob', 'Profile Handle'],
  },
  {
    name: 'Drawer Systems',
    subcategories: ['Tandem', 'Standard', 'Soft Close', 'Push to Open'],
    items: ['Tandem Runner 450mm', 'Tandem Runner 550mm', 'Standard Runner', 'Push to Open System'],
  },
  {
    name: 'Lift Systems',
    subcategories: ['Aventos', 'Stay Lift', 'Flap Stay'],
    items: ['Aventos HK-S', 'Aventos HF', 'Stay Lift', 'Flap Stay'],
  },
  {
    name: 'Organizers',
    subcategories: ['Cutlery', 'Plate', 'Bottle', 'Corner'],
    items: ['Cutlery Insert', 'Plate Holder', 'Bottle Pullout', 'Magic Corner', 'Carousel'],
  },
];

const BRANDS = ['Hettich', 'Blum', 'Hafele', 'Grass', 'Ebco', 'Godrej', 'Any'];

const PROJECTS = [
  { label: 'PRJ-2025-001 - Taj Hotels - Commercial Kitchen', value: 'PRJ-2025-001' },
  { label: 'PRJ-2025-002 - BigBasket - Cold Room', value: 'PRJ-2025-002' },
  { label: 'PRJ-2025-003 - L&T Campus - Industrial Kitchen', value: 'PRJ-2025-003' },
];

const initialItems: AccessoryItem[] = [
  {
    id: '1',
    category: 'Hinges',
    subcategory: 'Soft Close',
    name: 'Soft Close Hinge 110°',
    description: 'Full overlay soft close hinge',
    quantity: 24,
    unit: 'pcs',
    brand: 'Hettich',
    unitPrice: 185,
    totalPrice: 4440,
    leadTime: 3,
    stockStatus: 'in-stock',
    notes: 'For base and wall cabinets',
  },
  {
    id: '2',
    category: 'Handles',
    subcategory: 'Bar',
    name: 'Bar Handle 128mm',
    description: 'Brushed nickel finish',
    quantity: 18,
    unit: 'pcs',
    brand: 'Hafele',
    unitPrice: 320,
    totalPrice: 5760,
    leadTime: 5,
    stockStatus: 'in-stock',
    notes: 'Center to center 128mm',
  },
  {
    id: '3',
    category: 'Drawer Systems',
    subcategory: 'Tandem',
    name: 'Tandem Runner 450mm',
    description: 'Soft close full extension',
    quantity: 8,
    unit: 'sets',
    brand: 'Blum',
    unitPrice: 1850,
    totalPrice: 14800,
    leadTime: 7,
    stockStatus: 'low-stock',
    notes: '30kg load capacity',
  },
];

const initialFormData: FormData = {
  project: '',
  projectName: '',
  version: '1.0',
  items: initialItems,
  notes: '',
};

export default function AccessoriesBOMEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<AccessoryItem>>({
    category: '',
    subcategory: '',
    name: '',
    description: '',
    quantity: 1,
    unit: 'pcs',
    brand: 'Any',
    unitPrice: 0,
    leadTime: 7,
    notes: '',
  });

  // Auto-save draft
  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
    formData as unknown as Record<string, unknown>,
    {
      key: 'accessories-bom-form',
      debounceMs: 3000,
    }
  );

  // Unsaved changes warning
  const hasUnsavedChanges = formData.items.length !== initialItems.length || formData.project !== '';
  useUnsavedChangesWarning(hasUnsavedChanges && !isSubmitting);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setFormData(draft as unknown as FormData);
    }
  };

  // Form fields for progress indicator
  const formFields = useMemo(() => [
    { name: 'project', required: true },
    { name: 'items', required: true, validate: () => formData.items.length > 0 },
  ], [formData.items.length]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      itemCount: formData.items.length,
      totalQuantity: formData.items.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: formData.items.reduce((sum, item) => sum + item.totalPrice, 0),
      inStock: formData.items.filter(i => i.stockStatus === 'in-stock').length,
      lowStock: formData.items.filter(i => i.stockStatus === 'low-stock').length,
      outOfStock: formData.items.filter(i => i.stockStatus === 'out-of-stock').length,
    };
  }, [formData.items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return formData.items.filter(item => {
      const matchesSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [formData.items, searchTerm, selectedCategory]);

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

  // Add new item
  const handleAddItem = () => {
    if (!newItem.category || !newItem.name) {
      return;
    }

    const item: AccessoryItem = {
      id: Date.now().toString(),
      category: newItem.category || '',
      subcategory: newItem.subcategory || '',
      name: newItem.name || '',
      description: newItem.description || '',
      quantity: newItem.quantity || 1,
      unit: newItem.unit || 'pcs',
      brand: newItem.brand || 'Any',
      unitPrice: newItem.unitPrice || 0,
      totalPrice: (newItem.quantity || 1) * (newItem.unitPrice || 0),
      leadTime: newItem.leadTime || 7,
      stockStatus: 'in-stock',
      notes: newItem.notes || '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({
      category: '',
      subcategory: '',
      name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      brand: 'Any',
      unitPrice: 0,
      leadTime: 7,
      notes: '',
    });
    setShowAddForm(false);
  };

  // Update item
  const updateItem = (id: string, field: keyof AccessoryItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.totalPrice = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  // Delete item
  const deleteItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  // Duplicate item
  const duplicateItem = (item: AccessoryItem) => {
    const newItem: AccessoryItem = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (Copy)`,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.project) newErrors.project = 'Please select a project';
        break;
      case 1:
        if (formData.items.length === 0) newErrors.items = 'At least one item is required';
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('BOM submitted:', formData);
      clearDraft();
      router.push('/project-management/technical/specs/shutters');
    } catch (error) {
      console.error('Error submitting BOM:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get stock status badge
  const getStockBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">In Stock</span>;
      case 'low-stock':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Low Stock</span>;
      case 'out-of-stock':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Out of Stock</span>;
      default:
        return null;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Select Project</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={PROJECTS}
                  value={formData.project}
                  onChange={(val) => {
                    updateFormData('project', val);
                    const selectedProject = PROJECTS.find(p => p.value === val);
                    if (selectedProject) {
                      updateFormData('projectName', selectedProject.label.split(' - ')[1] || '');
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => updateFormData('version', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.0"
                />
              </div>
            </div>

            {formData.project && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Selected Project:</span> {formData.projectName}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This BOM will be linked to Phase 3: Technical Design & BOM
                </p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">BOM Items</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{totals.itemCount}</p>
                <p className="text-xs text-gray-500">Items</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{totals.totalQuantity}</p>
                <p className="text-xs text-blue-700">Total Qty</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{totals.inStock}</p>
                <p className="text-xs text-green-700">In Stock</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{totals.lowStock}</p>
                <p className="text-xs text-yellow-700">Low Stock</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totals.totalValue)}</p>
                <p className="text-xs text-purple-700">Total Value</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Brand</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      <span className="flex items-center justify-center gap-1">
                        Stock
                        <HelpIcon content={FIELD_HELP.stockCheck.content} size="sm" />
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category} &gt; {item.subcategory}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{item.brand}</td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="px-4 py-3 text-center">{getStockBadge(item.stockStatus)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => duplicateItem(item)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatCurrency(totals.totalValue)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {errors.items && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{errors.items}</p>
              </div>
            )}

            {/* Add Item Modal */}
            {showAddForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl p-3 w-full max-w-lg mx-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
                    <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          Category
                          <HelpIcon content={FIELD_HELP.category.content} size="sm" />
                        </label>
                        <SearchableSelect
                          options={CATEGORIES.map(cat => ({ label: cat.name, value: cat.name }))}
                          value={newItem.category ?? ''}
                          onChange={(val) => setNewItem({ ...newItem, category: val, subcategory: '' })}
                          placeholder="Select Category"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                        <SearchableSelect
                          options={(newItem.category && CATEGORIES.find(c => c.name === newItem.category)?.subcategories.map(sub => ({ label: sub, value: sub }))) || []}
                          value={newItem.subcategory ?? ''}
                          onChange={(val) => setNewItem({ ...newItem, subcategory: val })}
                          placeholder="Select Subcategory"
                          disabled={!newItem.category}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., Soft Close Hinge 110°"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
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
                          <option value="pcs">Pieces</option>
                          <option value="sets">Sets</option>
                          <option value="pairs">Pairs</option>
                          <option value="meters">Meters</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={newItem.unitPrice}
                          onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          Brand
                          <HelpIcon content={FIELD_HELP.brand.content} size="sm" />
                        </label>
                        <SearchableSelect
                          options={BRANDS.map(brand => ({ label: brand, value: brand }))}
                          value={newItem.brand ?? ''}
                          onChange={(val) => setNewItem({ ...newItem, brand: val })}
                          placeholder="Select Brand"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          Lead Time (days)
                          <HelpIcon content={FIELD_HELP.leadTime.content} size="sm" />
                        </label>
                        <input
                          type="number"
                          value={newItem.leadTime}
                          onChange={(e) => setNewItem({ ...newItem, leadTime: parseInt(e.target.value) || 7 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <input
                        type="text"
                        value={newItem.notes}
                        onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Brand, finish, specifications, etc."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!newItem.category || !newItem.name}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              {/* Project Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Project Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <p className="font-medium text-gray-900">{formData.projectName || formData.project}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">BOM Version:</span>
                    <p className="font-medium text-gray-900">{formData.version}</p>
                  </div>
                </div>
              </div>

              {/* BOM Summary */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">BOM Summary</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-gray-900">{totals.itemCount}</p>
                    <p className="text-sm text-gray-500">Line Items</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-blue-600">{totals.totalQuantity}</p>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalValue)}</p>
                    <p className="text-sm text-gray-500">Total Value</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex gap-2">
                      <span className="text-green-600">{totals.inStock} ✓</span>
                      <span className="text-yellow-600">{totals.lowStock} !</span>
                      <span className="text-red-600">{totals.outOfStock} ✗</span>
                    </div>
                    <p className="text-sm text-gray-500">Stock Status</p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">By Category</h3>
                <div className="space-y-2">
                  {CATEGORIES.filter(cat => formData.items.some(item => item.category === cat.name)).map(cat => {
                    const catItems = formData.items.filter(item => item.category === cat.name);
                    const catTotal = catItems.reduce((sum, item) => sum + item.totalPrice, 0);
                    return (
                      <div key={cat.name} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{cat.name}</span>
                          <span className="text-sm text-gray-500">({catItems.length} items)</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(catTotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes or special instructions..."
                />
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
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Accessories Bill of Materials</h1>
              <p className="text-sm text-gray-600 mt-1">Phase 3: Technical Design & BOM - Step 3.5</p>
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
              onClick={() => router.push('/project-management/technical/drawings')}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save BOM
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
