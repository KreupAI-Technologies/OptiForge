'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { estimationBOQService } from '@/services/estimation-boq.service';
import {
  ArrowLeft,
  Save,
  FileText,
  Building2,
  User,
  Calendar,
  Package,
  Plus,
  Trash2,
  IndianRupee,
  Hash,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface BOQItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
  specifications: string;
  category: string;
}

interface BOQFormData {
  boqNumber: string;
  projectName: string;
  clientName: string;
  projectLocation: string;
  projectDuration: string;
  revisionNumber: number;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'in_costing' | 'completed';
  currency: string;
  estimatedValue: number;
  notes: string;
  items: BOQItem[];
}

const units = ['MT', 'Kg', 'Cum', 'Sqm', 'Sqft', 'Rmt', 'No', 'Set', 'Ltr', 'Box', 'Pcs', 'Hrs', 'Days'];
const categories = ['Structural', 'Civil Works', 'HVAC', 'Electrical', 'Plumbing', 'Finishes', 'Equipment', 'Labour', 'Other'];
const currencies = ['INR', 'USD', 'EUR', 'GBP'];

export default function EditBOQPage() {
  const router = useRouter();
  const params = useParams();
  const boqId = params.id as string;

  const [formData, setFormData] = useState<BOQFormData>({
    boqNumber: '',
    projectName: '',
    clientName: '',
    projectLocation: '',
    projectDuration: '',
    revisionNumber: 1,
    status: 'draft',
    currency: 'INR',
    estimatedValue: 0,
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load BOQ + items by id
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const raw = (await estimationBOQService.findOne(boqId)) as any;
        const items = (await estimationBOQService.findItems(boqId)) as any[];
        if (cancelled) return;
        const loadedItems: BOQItem[] = (Array.isArray(items) ? items : []).map((it: any, idx: number) => ({
          id: it?.id ?? String(idx + 1),
          itemNo: it?.itemNo ?? '',
          description: it?.description ?? '',
          unit: it?.unit ?? 'No',
          quantity: Number(it?.quantity ?? 0),
          unitRate: Number(it?.unitRate ?? 0),
          totalAmount: Number(it?.totalAmount ?? 0),
          specifications: it?.specifications ?? '',
          category: it?.category ?? 'Other',
        }));
        setFormData((prev) => ({
          ...prev,
          boqNumber: raw?.boqNumber ?? prev.boqNumber,
          projectName: raw?.projectName ?? prev.projectName,
          clientName: raw?.clientName ?? prev.clientName,
          projectLocation: raw?.projectLocation ?? prev.projectLocation,
          projectDuration: raw?.projectDuration ?? prev.projectDuration,
          revisionNumber: raw?.revisionNumber != null ? Number(raw.revisionNumber) : prev.revisionNumber,
          status: (String(raw?.status ?? '').toLowerCase().replace(/\s+/g, '_') as BOQFormData['status']) || prev.status,
          currency: raw?.currency ?? prev.currency,
          estimatedValue: raw?.estimatedValue != null ? Number(raw.estimatedValue) : prev.estimatedValue,
          notes: raw?.notes ?? prev.notes,
          items: loadedItems,
        }));
      } catch {
        /* leave empty form */
      }
    };
    load();
    return () => { cancelled = true; };
  }, [boqId]);

  const updateFormData = (field: keyof BOQFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateItem = (index: number, field: keyof BOQItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-calculate total amount when quantity or unit rate changes
    if (field === 'quantity' || field === 'unitRate') {
      const item = updatedItems[index];
      updatedItems[index].totalAmount = item.quantity * item.unitRate;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateEstimatedValue(updatedItems);
  };

  const addNewItem = () => {
    const newItem: BOQItem = {
      id: Date.now().toString(),
      itemNo: '',
      description: '',
      unit: 'No',
      quantity: 0,
      unitRate: 0,
      totalAmount: 0,
      specifications: '',
      category: 'Other'
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      alert('At least one item is required');
      return;
    }
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateEstimatedValue(updatedItems);
  };

  const duplicateItem = (index: number) => {
    const itemToCopy = { ...formData.items[index] };
    itemToCopy.id = Date.now().toString();
    itemToCopy.itemNo = '';
    const updatedItems = [...formData.items];
    updatedItems.splice(index + 1, 0, itemToCopy);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateEstimatedValue(updatedItems);
  };

  const calculateEstimatedValue = (items: BOQItem[]) => {
    const total = items.reduce((sum, item) => sum + item.totalAmount, 0);
    setFormData(prev => ({ ...prev, estimatedValue: total }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one BOQ item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitRate <= 0) {
        newErrors[`item_${index}_unitRate`] = 'Unit rate must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      await estimationBOQService.update(boqId, {
        boqNumber: formData.boqNumber,
        projectName: formData.projectName,
        clientName: formData.clientName,
        projectLocation: formData.projectLocation,
        projectDuration: formData.projectDuration,
        currency: formData.currency,
        estimatedValue: formData.estimatedValue,
        notes: formData.notes,
        status: (formData.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())) as any,
        items: formData.items,
      } as any);
      router.push(`/estimation/boq/view/${boqId}`);
    } catch (error) {
      console.error('Error updating BOQ:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.back();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Bill of Quantities</h1>
                <p className="text-sm text-gray-600">BOQ ID: {boqId} - Revision {formData.revisionNumber}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="flex items-center space-x-3 mb-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BOQ Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.boqNumber}
                  onChange={(e) => updateFormData('boqNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                  placeholder="Enter project name"
                />
                {errors.projectName && (
                  <p className="mt-1 text-xs text-red-500">{errors.projectName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => updateFormData('clientName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter client name"
                />
                {errors.clientName && (
                  <p className="mt-1 text-xs text-red-500">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Location</label>
                <input
                  type="text"
                  value={formData.projectLocation}
                  onChange={(e) => updateFormData('projectLocation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Duration</label>
                <input
                  type="text"
                  value={formData.projectDuration}
                  onChange={(e) => updateFormData('projectDuration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 18 months"
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
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="in_costing">In Costing</option>
                  <option value="completed">Completed</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revision Number</label>
                <input
                  type="number"
                  value={formData.revisionNumber}
                  onChange={(e) => updateFormData('revisionNumber', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Special Instructions</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any notes or special instructions"
              />
            </div>
          </div>

          {/* BOQ Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">BOQ Items</h2>
              </div>
              <button
                onClick={addNewItem}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Item</span>
              </button>
            </div>

            {errors.items && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description *</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Specifications</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qty *</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Rate *</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.itemNo}
                          onChange={(e) => updateItem(index, 'itemNo', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="A.1.1"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className={`w-full min-w-[200px] px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.specifications}
                          onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                          className="w-full min-w-[150px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Specifications"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(index, 'category', e.target.value)}
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
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
                          value={item.unitRate}
                          onChange={(e) => updateItem(index, 'unitRate', parseFloat(e.target.value) || 0)}
                          className={`w-32 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            errors[`item_${index}_unitRate`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formData.currency === 'INR' ? '₹' : formData.currency} {item.totalAmount.toLocaleString()}
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
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-right text-base font-bold text-gray-900">
                      Total Estimated Value:
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="text-xl font-bold text-blue-900">
                        {formData.currency === 'INR' ? '₹' : formData.currency} {formData.estimatedValue.toLocaleString()}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
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
