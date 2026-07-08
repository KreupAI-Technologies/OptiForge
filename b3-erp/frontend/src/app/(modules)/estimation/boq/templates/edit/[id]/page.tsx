'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Save, AlertTriangle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { estimationTemplateService } from '@/services/estimation-template.service';

interface BOQItem {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  specifications: string;
}

const categoryOptions = [
  'Civil Works',
  'Electrical Works',
  'Plumbing Works',
  'HVAC Works',
  'Finishing Works',
  'Structural Works',
  'Landscaping',
  'Interior Works',
  'Other',
];

const unitOptions = [
  'nos',
  'sq.m',
  'cu.m',
  'm',
  'kg',
  'ton',
  'ls',
  'rm',
  'sqft',
  'cft',
  'bag',
  'lit',
];

export default function EditBOQTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const [templateName, setTemplateName] = useState('');
  const [templateCode, setTemplateCode] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load template data
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const raw = (await estimationTemplateService.findTemplateById(templateId)) as any;
        if (cancelled || !raw) return;
        setTemplateName(raw.name ?? '');
        setTemplateCode(raw.templateCode ?? raw.code ?? '');
        setCategory(raw.category ?? raw.templateType ?? '');
        setDescription(raw.description ?? '');
        setUsageCount(Number(raw.usageCount ?? 0));
        const loadedItems: BOQItem[] = Array.isArray(raw.items)
          ? raw.items.map((it: any, idx: number) => ({
              id: it?.id ?? String(idx + 1),
              itemCode: it?.itemCode ?? it?.itemNo ?? '',
              description: it?.description ?? '',
              category: it?.category ?? '',
              unit: it?.unit ?? 'nos',
              quantity: Number(it?.quantity ?? 0),
              rate: Number(it?.rate ?? it?.unitRate ?? 0),
              amount: Number(it?.amount ?? it?.totalAmount ?? 0),
              specifications: it?.specifications ?? '',
            }))
          : [];
        setItems(loadedItems);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [templateId]);

  const handleBack = () => {
    router.push('/estimation/boq/templates');
  };

  const addItem = () => {
    const newItem: BOQItem = {
      id: Date.now().toString(),
      itemCode: '',
      description: '',
      category: '',
      unit: 'nos',
      quantity: 0,
      rate: 0,
      amount: 0,
      specifications: '',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BOQItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSave = async () => {
    // Validation
    if (!templateName.trim()) {
      alert('Please enter template name');
      return;
    }
    if (!templateCode.trim()) {
      alert('Please enter template code');
      return;
    }
    if (!category) {
      alert('Please select a category');
      return;
    }

    // Validate items
    const invalidItems = items.filter(
      (item) =>
        !item.itemCode.trim() ||
        !item.description.trim() ||
        !item.category ||
        item.quantity <= 0 ||
        item.rate <= 0
    );

    if (invalidItems.length > 0) {
      alert('Please fill in all required fields for all items (Item Code, Description, Category, Quantity > 0, Rate > 0)');
      return;
    }

    setIsSaving(true);
    try {
      await estimationTemplateService.updateBoqTemplate(templateId, {
        name: templateName,
        templateCode,
        category,
        description,
        items,
        estimatedValue: calculateTotal(),
      });
      router.push('/estimation/boq/templates');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit BOQ Template</h1>
              <p className="text-sm text-gray-500 mt-1">{templateCode}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Main Content - Left Side */}
          <div className="col-span-2 space-y-3">
            {/* Template Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Template Information</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Standard Commercial Building"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateCode}
                      onChange={(e) => setTemplateCode(e.target.value)}
                      placeholder="e.g., BOQ-TEMP-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Construction">Construction</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the template"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* BOQ Items */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">BOQ Items</h2>
                  <button
                    onClick={addItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Item #{index + 1}</h3>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Item Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) => updateItem(item.id, 'itemCode', e.target.value)}
                            placeholder="e.g., CIVIL-001"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            {categoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) =>
                              updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Rate (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={item.rate || ''}
                            onChange={(e) =>
                              updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Amount (₹)
                          </label>
                          <input
                            type="text"
                            value={item.amount.toLocaleString()}
                            disabled
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Specifications
                          </label>
                          <input
                            type="text"
                            value={item.specifications}
                            onChange={(e) => updateItem(item.id, 'specifications', e.target.value)}
                            placeholder="Technical specifications, standards, brand, etc."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <div className="text-base font-semibold text-gray-900">
                      Total Estimated Value ({items.length} items)
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pb-6">
                <button
                  onClick={handleBack}
                  disabled={isSaving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

          {/* Sidebar - Right Side */}
          <div className="col-span-1 space-y-3">
            {/* Usage Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Usage Statistics</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Times Used</p>
                    <p className="text-3xl font-bold text-blue-600">{usageCount}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Total Items</p>
                    <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Estimated Value</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{calculateTotal().toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Warning if actively used */}
                {usageCount > 0 && (
                  <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-amber-900 mb-1">
                          Template In Use
                        </h3>
                        <p className="text-xs text-amber-700">
                          This template has been used {usageCount} times. Changes may affect existing BOQs that reference this template.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
