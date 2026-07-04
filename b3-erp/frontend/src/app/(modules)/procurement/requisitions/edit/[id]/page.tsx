'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchRecordById } from '@/services/master-data.service';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  User,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  Package,
  DollarSign,
  Search,
  Upload,
  MessageSquare,
} from 'lucide-react';

// TypeScript Interfaces
interface RequisitionItem {
  id: string;
  itemCode: string;
  description: string;
  specifications: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  preferredVendor: string;
  category: 'raw_materials' | 'spare_parts' | 'consumables' | 'capital_goods' | 'services' | '';
}

interface RequisitionFormData {
  prNumber: string;
  requestedBy: string;
  requesterEmail: string;
  requesterDepartment: string;
  requestDate: string;
  requiredByDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | '';
  purpose: string;
  justification: string;
  budgetCode: string;
  costCenter: string;
  items: RequisitionItem[];
  notes: string;
  attachments: string[];
}

const departments = [
  'Production',
  'Maintenance',
  'Quality Control',
  'R&D',
  'Administration',
  'IT',
  'Sales & Marketing',
  'Finance',
  'HR',
  'Logistics',
  'Warehouse',
];

const priorities = [
  { value: 'low', label: 'Low', description: 'Can wait, no urgent need', color: 'green' },
  { value: 'medium', label: 'Medium', description: 'Required for regular operations', color: 'yellow' },
  { value: 'high', label: 'High', description: 'Important for production continuity', color: 'orange' },
  { value: 'urgent', label: 'Urgent', description: 'Critical - Immediate action required', color: 'red' },
];

const categories = [
  'raw_materials',
  'spare_parts',
  'consumables',
  'capital_goods',
  'services',
];

const units = [
  'Nos',
  'Pcs',
  'Sets',
  'Kg',
  'Liters',
  'Meters',
  'Sheets',
  'Drums',
  'Boxes',
  'Rolls',
  'Hours',
  'Days',
];

export default function EditRequisitionPage() {
  const router = useRouter();
  const params = useParams();
  const requisitionId = params.id as string;

  const [formData, setFormData] = useState<RequisitionFormData>({
    prNumber: 'PR-2025-0142',
    requestedBy: 'Anil Kumar Sharma',
    requesterEmail: 'anil.sharma@b3macbis.com',
    requesterDepartment: 'Production',
    requestDate: '2025-10-15',
    requiredByDate: '2025-10-30',
    priority: 'high',
    purpose: 'Replacement of worn-out machinery parts and critical raw materials for ongoing production',
    justification: 'Current machinery parts are showing significant wear and tear affecting production efficiency by 15%. Immediate replacement required to maintain production targets for Q4 2025. Raw materials stock has reached reorder level.',
    budgetCode: 'PROD-2025-Q4',
    costCenter: 'PROD-001',
    items: [
      {
        id: '1',
        itemCode: 'SP-CNC-2045',
        description: 'CNC Router Spindle Bearing Assembly',
        specifications: 'High-precision bearing, SKF/NSK brand, 60mm bore, 110mm OD, sealed type',
        quantity: 2,
        unit: 'Nos',
        estimatedUnitPrice: 12500,
        estimatedTotal: 25000,
        preferredVendor: 'SKF India Ltd',
        category: 'spare_parts',
      },
      {
        id: '2',
        itemCode: 'RM-PLY-001',
        description: 'Commercial Grade Plywood 19mm',
        specifications: 'BWP grade, 8x4 ft, ISI marked, moisture resistant, smooth finish both sides',
        quantity: 150,
        unit: 'Sheets',
        estimatedUnitPrice: 1850,
        estimatedTotal: 277500,
        preferredVendor: 'Greenply Industries',
        category: 'raw_materials',
      },
    ],
    notes: 'Urgent requirement for production line 3. Please expedite approval process.',
    attachments: ['technical_specs.pdf', 'machinery_inspection_report.pdf'],
  });

  const [newItem, setNewItem] = useState<Partial<RequisitionItem>>({
    itemCode: '',
    description: '',
    specifications: '',
    quantity: 0,
    unit: 'Nos',
    estimatedUnitPrice: 0,
    estimatedTotal: 0,
    preferredVendor: '',
    category: '',
  });

  // Fetch the live record and prefill when available; existing mock stays as fallback
  useEffect(() => {
    if (!requisitionId) return;
    fetchRecordById<RequisitionFormData>('/procurement/purchase-requisitions', requisitionId).then((record) => {
      if (record) {
        setFormData((prev) => ({ ...prev, ...record }));
      }
    });
  }, [requisitionId]);

  const updateFormData = (field: keyof RequisitionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof RequisitionItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Calculate estimated total
    if (field === 'quantity' || field === 'estimatedUnitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'estimatedUnitPrice' ? value : updatedItems[index].estimatedUnitPrice;
      updatedItems[index].estimatedTotal = quantity * unitPrice;
    }

    updateFormData('items', updatedItems);
  };

  const addItem = () => {
    if (newItem.itemCode && newItem.description && newItem.quantity && newItem.quantity > 0) {
      const item: RequisitionItem = {
        id: Date.now().toString(),
        itemCode: newItem.itemCode || '',
        description: newItem.description || '',
        specifications: newItem.specifications || '',
        quantity: newItem.quantity || 0,
        unit: newItem.unit || 'Nos',
        estimatedUnitPrice: newItem.estimatedUnitPrice || 0,
        estimatedTotal: (newItem.quantity || 0) * (newItem.estimatedUnitPrice || 0),
        preferredVendor: newItem.preferredVendor || '',
        category: newItem.category || 'raw_materials',
      };
      updateFormData('items', [...formData.items, item]);
      setNewItem({
        itemCode: '',
        description: '',
        specifications: '',
        quantity: 0,
        unit: 'Nos',
        estimatedUnitPrice: 0,
        estimatedTotal: 0,
        preferredVendor: '',
        category: '',
      });
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    updateFormData('items', updatedItems);
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.estimatedTotal, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    router.push(`/procurement/requisitions/view/${requisitionId}`);
  };

  const handleCancel = () => {
    router.push(`/procurement/requisitions/view/${requisitionId}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Requisition</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Purchase Requisition</h1>
              <p className="text-sm text-gray-600">{formData.prNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Requester Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            Requester Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.requestedBy}
                onChange={(e) => updateFormData('requestedBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                required
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from logged-in user</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.requesterEmail}
                onChange={(e) => updateFormData('requesterEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                required
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.requesterDepartment}
                onChange={(e) => updateFormData('requesterDepartment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.requestDate}
                onChange={(e) => updateFormData('requestDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required By Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.requiredByDate}
                onChange={(e) => updateFormData('requiredByDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={formData.requestDate}
              />
              <p className="text-xs text-gray-500 mt-1">Must be a future date</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Code
              </label>
              <input
                type="text"
                value={formData.budgetCode}
                onChange={(e) => updateFormData('budgetCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PROD-2025-Q4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Center
              </label>
              <input
                type="text"
                value={formData.costCenter}
                onChange={(e) => updateFormData('costCenter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PROD-001"
              />
            </div>
          </div>
        </div>

        {/* Priority Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="h-6 w-6 mr-2 text-blue-600" />
            Priority Level <span className="text-red-500 ml-1">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {priorities.map((priority) => (
              <div
                key={priority.value}
                onClick={() => updateFormData('priority', priority.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.priority === priority.value
                    ? `border-${priority.color}-500 bg-${priority.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    checked={formData.priority === priority.value}
                    onChange={() => updateFormData('priority', priority.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 font-semibold text-gray-900">{priority.label}</label>
                </div>
                <p className="text-xs text-gray-600">{priority.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose & Justification */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Purpose & Justification
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => updateFormData('purpose', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the purpose of this requisition..."
                required
                minLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 20 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.justification}
                onChange={(e) => updateFormData('justification', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed justification for approval (minimum 50 characters)..."
                required
                minLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters required for approval. Current: {formData.justification.length} characters
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            Line Items ({formData.items.length})
          </h2>

          {/* Existing Items */}
          <div className="space-y-2 mb-3">
            {formData.items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Item Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-1/3 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {units.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Specifications
                    </label>
                    <input
                      type="text"
                      value={item.specifications}
                      onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Technical specifications..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estimated Unit Price
                    </label>
                    <input
                      type="number"
                      value={item.estimatedUnitPrice}
                      onChange={(e) => updateItem(index, 'estimatedUnitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estimated Total
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(item.estimatedTotal)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold text-green-600"
                      disabled
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Preferred Vendor
                    </label>
                    <input
                      type="text"
                      value={item.preferredVendor}
                      onChange={(e) => updateItem(index, 'preferredVendor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional - Suggest a vendor..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 bg-blue-50">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Add New Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search or enter code"
                  />
                  <Search className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Item description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-1/3 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
                <input
                  type="text"
                  value={newItem.specifications}
                  onChange={(e) => setNewItem({ ...newItem, specifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technical specifications..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Est. Unit Price</label>
                <input
                  type="number"
                  value={newItem.estimatedUnitPrice}
                  onChange={(e) => setNewItem({ ...newItem, estimatedUnitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Vendor</label>
                <input
                  type="text"
                  value={newItem.preferredVendor}
                  onChange={(e) => setNewItem({ ...newItem, preferredVendor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span className="text-lg font-bold text-gray-900">Estimated Total Value:</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
            Additional Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes or special instructions..."
          />
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-blue-600" />
            Attachments
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Upload specifications, drawings, or quotes</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
          </div>
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-900">{file}</span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              All fields marked with <span className="text-red-500">*</span> are required
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
