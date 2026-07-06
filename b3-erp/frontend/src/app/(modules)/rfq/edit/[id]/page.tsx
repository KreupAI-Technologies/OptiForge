'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MasterDataService, mdLabel, MDVendor, fetchRecordById } from '@/services/master-data.service';
import { procurementRFQService, type UpdateRFQDto } from '@/services/procurement-rfq.service';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Building2,
  Package,
  DollarSign,
  FileText,
  Search,
  Upload,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

// TypeScript Interfaces
interface RFQItem {
  id: string;
  itemCode: string;
  description: string;
  specifications: string;
  quantity: number;
  unit: string;
  targetPrice: number;
}

interface Vendor {
  id: string;
  vendorId: string;
  vendorName: string;
  category: string;
  email: string;
  phone: string;
  rating: number;
  selected: boolean;
}

interface RFQFormData {
  rfqNumber: string;
  title: string;
  category: 'raw_materials' | 'components' | 'services' | 'equipment' | '';
  linkedPR: string;
  issueDate: string;
  closingDate: string;
  validityPeriod: number;
  items: RFQItem[];
  selectedVendors: string[];
  commercialTerms: {
    paymentTerms: string;
    deliveryTerms: string;
    incoterms: string;
    inspectionRequirements: string;
  };
  evaluationCriteria: {
    price: number;
    quality: number;
    deliveryTime: number;
    paymentTerms: number;
  };
  termsAndConditions: string;
  notesToVendors: string;
  attachments: string[];
}

const categories = [
  { value: 'raw_materials', label: 'Raw Materials' },
  { value: 'components', label: 'Components' },
  { value: 'services', label: 'Services' },
  { value: 'equipment', label: 'Equipment' },
];

const units = ['Nos', 'Pcs', 'Sets', 'Kg', 'Liters', 'Meters', 'Sheets', 'Drums', 'Boxes', 'Rolls', 'Hours', 'Days'];

const paymentTermsOptions = ['Advance Payment', 'Net 15 days', 'Net 30 days', 'Net 45 days', 'Net 60 days', 'Against Delivery'];
const deliveryTermsOptions = ['Door Delivery', 'Ex-Works', 'FOB', 'CIF', 'C&F'];
const incotermsOptions = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

// Seed vendor list — used as initial state; overwritten by live API when available
const mockVendorsSeed: Vendor[] = [
  { id: '1', vendorId: 'V-001', vendorName: 'SKF India Ltd', category: 'Spare Parts', email: 'contact@skfindia.com', phone: '+91-22-4567-1234', rating: 4.5, selected: true },
  { id: '2', vendorId: 'V-002', vendorName: 'Greenply Industries', category: 'Raw Materials', email: 'sales@greenply.com', phone: '+91-22-4567-5678', rating: 4.3, selected: true },
  { id: '3', vendorId: 'V-003', vendorName: 'Hettich India', category: 'Hardware', email: 'info@hettich.com', phone: '+91-22-4567-9012', rating: 4.7, selected: false },
  { id: '4', vendorId: 'V-004', vendorName: 'Parker Hannifin India', category: 'Spare Parts', email: 'sales@parker.com', phone: '+91-22-4567-3456', rating: 4.4, selected: false },
  { id: '5', vendorId: 'V-005', vendorName: 'Saint-Gobain Abrasives', category: 'Consumables', email: 'contact@saint-gobain.com', phone: '+91-22-4567-7890', rating: 4.2, selected: false },
];

export default function EditRFQPage() {
  const router = useRouter();
  const params = useParams();
  const rfqId = params.id as string;

  const [formData, setFormData] = useState<RFQFormData>({
    rfqNumber: 'RFQ-2025-0087',
    title: 'Procurement of CNC Machine Spare Parts and Raw Materials',
    category: 'raw_materials',
    linkedPR: 'PR-2025-0142',
    issueDate: '2025-10-12',
    closingDate: '2025-10-25',
    validityPeriod: 30,
    items: [
      {
        id: '1',
        itemCode: 'SP-CNC-2045',
        description: 'CNC Router Spindle Bearing Assembly',
        specifications: 'High-precision bearing, SKF/NSK brand, 60mm bore, 110mm OD',
        quantity: 2,
        unit: 'Nos',
        targetPrice: 12500,
      },
      {
        id: '2',
        itemCode: 'RM-PLY-001',
        description: 'Commercial Grade Plywood 19mm',
        specifications: 'BWP grade, 8x4 ft, ISI marked',
        quantity: 150,
        unit: 'Sheets',
        targetPrice: 1850,
      },
    ],
    selectedVendors: ['1', '2'],
    commercialTerms: {
      paymentTerms: 'Net 30 days from delivery',
      deliveryTerms: 'Door delivery to factory premises',
      incoterms: 'Ex-Works (Factory)',
      inspectionRequirements: 'Quality inspection required before acceptance',
    },
    evaluationCriteria: {
      price: 50,
      quality: 30,
      deliveryTime: 15,
      paymentTerms: 5,
    },
    termsAndConditions: `1. All prices should be quoted in INR including GST
2. Payment terms: Net 30 days from delivery
3. Delivery must be made to our factory premises
4. Quality inspection will be conducted before acceptance
5. Vendor must provide warranty as per industry standards`,
    notesToVendors: 'Please ensure all items are original and come with manufacturer warranties.',
    attachments: ['technical_specs.pdf'],
  });

  const [newItem, setNewItem] = useState<Partial<RFQItem>>({
    itemCode: '',
    description: '',
    specifications: '',
    quantity: 0,
    unit: 'Nos',
    targetPrice: 0,
  });

  const [vendors, setVendors] = useState<Vendor[]>(mockVendorsSeed);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorFilter, setVendorFilter] = useState('');

  // Fetch live vendors; seed stays as fallback
  useEffect(() => {
    setIsLoadingVendors(true);
    MasterDataService.getVendors().then((liveVendors) => {
      if (liveVendors.length > 0) {
        setVendors(
          liveVendors.map((v: MDVendor) => ({
            id: v.id,
            vendorId: v.vendorCode || v.id,
            vendorName: mdLabel.vendor(v),
            category: v.category || '',
            email: v.email || '',
            phone: '',
            rating: 0,
            selected: false,
          }))
        );
      }
    }).finally(() => setIsLoadingVendors(false));
  }, []);

  // Fetch live record and prefill; existing mock data stays as fallback
  useEffect(() => {
    if (!rfqId) return;
    fetchRecordById<RFQFormData>('/procurement/rfqs', rfqId).then((record) => {
      if (record) {
        setFormData((prev) => ({ ...prev, ...record }));
      }
    });
  }, [rfqId]);

  const updateFormData = (field: keyof RFQFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCommercialTerms = (field: keyof typeof formData.commercialTerms, value: string) => {
    setFormData(prev => ({
      ...prev,
      commercialTerms: { ...prev.commercialTerms, [field]: value }
    }));
  };

  const updateEvaluationCriteria = (field: keyof typeof formData.evaluationCriteria, value: number) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: { ...prev.evaluationCriteria, [field]: value }
    }));
  };

  const updateItem = (index: number, field: keyof RFQItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updateFormData('items', updatedItems);
  };

  const addItem = () => {
    if (newItem.itemCode && newItem.description && newItem.quantity && newItem.quantity > 0) {
      const item: RFQItem = {
        id: Date.now().toString(),
        itemCode: newItem.itemCode || '',
        description: newItem.description || '',
        specifications: newItem.specifications || '',
        quantity: newItem.quantity || 0,
        unit: newItem.unit || 'Nos',
        targetPrice: newItem.targetPrice || 0,
      };
      updateFormData('items', [...formData.items, item]);
      setNewItem({
        itemCode: '',
        description: '',
        specifications: '',
        quantity: 0,
        unit: 'Nos',
        targetPrice: 0,
      });
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    updateFormData('items', updatedItems);
  };

  const toggleVendor = (vendorId: string) => {
    const selectedVendors = formData.selectedVendors.includes(vendorId)
      ? formData.selectedVendors.filter(id => id !== vendorId)
      : [...formData.selectedVendors, vendorId];
    updateFormData('selectedVendors', selectedVendors);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateRFQDto = {
      title: formData.title,
      prReference: formData.linkedPR || undefined,
      department: formData.category || 'General',
      responseDeadline: formData.closingDate,
      requiredDeliveryDate: formData.closingDate,
      currency: 'INR',
      notes: formData.notesToVendors || undefined,
      terms: formData.termsAndConditions || undefined,
      items: formData.items.map((it) => ({
        itemId: it.itemCode || it.id,
        quantity: it.quantity,
        specifications: it.specifications || undefined,
        targetPrice: it.targetPrice || undefined,
        requiredDate: formData.closingDate,
      })),
      vendorIds: formData.selectedVendors,
    };
    try {
      await procurementRFQService.updateRFQ(rfqId, payload);
      router.push(`/rfq/view/${rfqId}`);
    } catch (err) {
      console.error('Error updating RFQ:', err);
      alert('Failed to update RFQ');
    }
  };

  const handleCancel = () => {
    router.push(`/rfq/view/${rfqId}`);
  };

  const filteredVendors = vendors.filter(v =>
    v.vendorName.toLowerCase().includes(vendorFilter.toLowerCase()) ||
    v.category.toLowerCase().includes(vendorFilter.toLowerCase())
  );

  const evaluationTotal = Object.values(formData.evaluationCriteria).reduce((sum, val) => sum + val, 0);

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to RFQ</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Request for Quotation</h1>
              <p className="text-sm text-gray-600">{formData.rfqNumber}</p>
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
        {/* RFQ Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            RFQ Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFQ Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linked Purchase Requisition
              </label>
              <input
                type="text"
                value={formData.linkedPR}
                onChange={(e) => updateFormData('linkedPR', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional - PR Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => updateFormData('issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.closingDate}
                onChange={(e) => updateFormData('closingDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={formData.issueDate}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 7 days from issue date</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Validity Period (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.validityPeriod}
                onChange={(e) => updateFormData('validityPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      value={item.itemCode}
                      onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
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

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Target Price</label>
                    <input
                      type="number"
                      value={item.targetPrice}
                      onChange={(e) => updateItem(index, 'targetPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
                    <input
                      type="text"
                      value={item.specifications}
                      onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <input
                  type="text"
                  value={newItem.itemCode}
                  onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Price</label>
                <input
                  type="number"
                  value={newItem.targetPrice}
                  onChange={(e) => setNewItem({ ...newItem, targetPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
                <input
                  type="text"
                  value={newItem.specifications}
                  onChange={(e) => setNewItem({ ...newItem, specifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        {/* Vendor Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Vendor Selection ({formData.selectedVendors.length} selected)
            {isLoadingVendors && <span className="ml-3 text-xs text-gray-400">Loading…</span>}
          </h2>

          <div className="mb-2">
            <div className="relative">
              <input
                type="text"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by vendor name or category..."
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {formData.selectedVendors.length < 3 && (
              <p className="text-xs text-red-500 mt-1">Minimum 3 vendors required</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => toggleVendor(vendor.id)}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  formData.selectedVendors.includes(vendor.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedVendors.includes(vendor.id)}
                      onChange={() => toggleVendor(vendor.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 font-bold text-gray-900">{vendor.vendorName}</label>
                  </div>
                  <span className="text-xs font-semibold text-yellow-600">★ {vendor.rating}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{vendor.category}</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 truncate">{vendor.email}</p>
                  <p className="text-xs text-gray-600">{vendor.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Terms */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
            Commercial Terms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              <select
                value={formData.commercialTerms.paymentTerms}
                onChange={(e) => updateCommercialTerms('paymentTerms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paymentTermsOptions.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Terms</label>
              <select
                value={formData.commercialTerms.deliveryTerms}
                onChange={(e) => updateCommercialTerms('deliveryTerms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {deliveryTermsOptions.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Incoterms</label>
              <select
                value={formData.commercialTerms.incoterms}
                onChange={(e) => updateCommercialTerms('incoterms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {incotermsOptions.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Requirements</label>
              <input
                type="text"
                value={formData.commercialTerms.inspectionRequirements}
                onChange={(e) => updateCommercialTerms('inspectionRequirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-blue-600" />
            Evaluation Criteria (Weighted %)
          </h2>
          <div className="space-y-2">
            {Object.entries(formData.evaluationCriteria).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <span className="text-sm font-bold text-blue-600">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => updateEvaluationCriteria(key as any, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
            <div className={`mt-4 p-3 rounded-lg ${evaluationTotal === 100 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-semibold ${evaluationTotal === 100 ? 'text-green-700' : 'text-red-700'}`}>
                Total: {evaluationTotal}% {evaluationTotal !== 100 && '(Must equal 100%)'}
              </p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Terms & Conditions
          </h2>
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter terms and conditions..."
          />
        </div>

        {/* Notes to Vendors */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Info className="h-6 w-6 mr-2 text-blue-600" />
            Notes to Vendors
          </h2>
          <textarea
            value={formData.notesToVendors}
            onChange={(e) => updateFormData('notesToVendors', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Special instructions or requirements..."
          />
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-blue-600" />
            Technical Specifications & Attachments
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Upload drawings, specifications, or additional documents</p>
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
                  <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
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
              Ensure all required fields are filled before saving
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
