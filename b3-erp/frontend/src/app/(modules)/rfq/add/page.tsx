'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MasterDataService, mdLabel, MDVendor } from '@/services/master-data.service';
import { procurementRFQService, type CreateRFQDto } from '@/services/procurement-rfq.service';
import {
  ArrowLeft,
  Save,
  Send,
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
  X,
  Mail,
  Phone,
  Star,
  TrendingUp,
  FileSignature,
  Filter,
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
  pastPerformance: string;
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
  attachments: File[];
}

const categories = [
  { value: 'raw_materials', label: 'Raw Materials', description: 'Materials for production', minDays: 7 },
  { value: 'components', label: 'Components', description: 'Parts and assemblies', minDays: 7 },
  { value: 'services', label: 'Services', description: 'Professional services', minDays: 3 },
  { value: 'equipment', label: 'Equipment', description: 'Machinery and tools', minDays: 10 },
];

const units = ['Nos', 'Pcs', 'Sets', 'Kg', 'Liters', 'Meters', 'Sheets', 'Drums', 'Boxes', 'Rolls', 'Hours', 'Days'];

const paymentTermsOptions = [
  'Advance Payment',
  'Net 15 days',
  'Net 30 days',
  'Net 45 days',
  'Net 60 days',
  'Against Delivery',
  '30-60-90 days',
  'LC (Letter of Credit)',
];

const deliveryTermsOptions = [
  'Door Delivery',
  'Ex-Works',
  'FOB Origin',
  'CIF',
  'C&F',
  'FCA',
];

const incotermsOptions = [
  'EXW (Ex Works)',
  'FCA (Free Carrier)',
  'FOB (Free on Board)',
  'CFR (Cost and Freight)',
  'CIF (Cost, Insurance and Freight)',
  'CPT (Carriage Paid To)',
  'CIP (Carriage and Insurance Paid To)',
  'DAP (Delivered at Place)',
  'DPU (Delivered at Place Unloaded)',
  'DDP (Delivered Duty Paid)',
];

// Mock PRs for loading
const mockPRs = [
  { id: 'PR-2025-0142', title: 'CNC Machine Spare Parts', itemCount: 8 },
  { id: 'PR-2025-0135', title: 'Raw Materials - Plywood and Hardware', itemCount: 5 },
  { id: 'PR-2025-0128', title: 'Consumables for Q4 2025', itemCount: 12 },
];

// Seed vendor list — used as initial state; overwritten by live API when available
const mockVendorsSeed: Vendor[] = [
  {
    id: '1',
    vendorId: 'V-001',
    vendorName: 'SKF India Ltd',
    category: 'Spare Parts, Bearings',
    email: 'contact@skfindia.com',
    phone: '+91-22-4567-1234',
    rating: 4.5,
    pastPerformance: 'Excellent - 15 orders, 98% on-time delivery',
    selected: false,
  },
  {
    id: '2',
    vendorId: 'V-002',
    vendorName: 'Greenply Industries',
    category: 'Raw Materials, Plywood',
    email: 'sales@greenply.com',
    phone: '+91-22-4567-5678',
    rating: 4.3,
    pastPerformance: 'Good - 22 orders, 95% on-time delivery',
    selected: false,
  },
  {
    id: '3',
    vendorId: 'V-003',
    vendorName: 'Hettich India Pvt Ltd',
    category: 'Hardware, Hinges',
    email: 'info@hettich.com',
    phone: '+91-22-4567-9012',
    rating: 4.7,
    pastPerformance: 'Excellent - 28 orders, 99% on-time delivery',
    selected: false,
  },
  {
    id: '4',
    vendorId: 'V-004',
    vendorName: 'Parker Hannifin India',
    category: 'Spare Parts, Hydraulics',
    email: 'sales@parker.com',
    phone: '+91-22-4567-3456',
    rating: 4.4,
    pastPerformance: 'Good - 18 orders, 96% on-time delivery',
    selected: false,
  },
  {
    id: '5',
    vendorId: 'V-005',
    vendorName: 'Saint-Gobain Abrasives',
    category: 'Consumables, Abrasives',
    email: 'contact@saint-gobain.com',
    phone: '+91-22-4567-7890',
    rating: 4.2,
    pastPerformance: 'Good - 12 orders, 94% on-time delivery',
    selected: false,
  },
  {
    id: '6',
    vendorId: 'V-006',
    vendorName: 'Siemens India Ltd',
    category: 'Electrical, Automation',
    email: 'contact@siemens.co.in',
    phone: '+91-22-4567-2345',
    rating: 4.6,
    pastPerformance: 'Excellent - 10 orders, 97% on-time delivery',
    selected: false,
  },
  {
    id: '7',
    vendorId: 'V-007',
    vendorName: 'Asian Paints Ltd',
    category: 'Consumables, Paints',
    email: 'sales@asianpaints.com',
    phone: '+91-22-4567-6789',
    rating: 4.1,
    pastPerformance: 'Good - 20 orders, 93% on-time delivery',
    selected: false,
  },
  {
    id: '8',
    vendorId: 'V-008',
    vendorName: 'Pidilite Industries',
    category: 'Consumables, Adhesives',
    email: 'b2b@pidilite.com',
    phone: '+91-22-4567-4567',
    rating: 4.3,
    pastPerformance: 'Good - 25 orders, 95% on-time delivery',
    selected: false,
  },
];

const termsTemplate = `1. All prices should be quoted in INR including GST (18% or as applicable)
2. Payment terms will be as specified in the commercial terms section
3. Delivery must be made to our factory premises at ManufacturingOS, Bhiwandi, Maharashtra
4. Quality inspection will be conducted before acceptance
5. Vendor must provide warranty as per industry standards (minimum 6 months)
6. Late delivery penalties: 1% of order value per week delay (maximum 5%)
7. Materials must be original and come with manufacturer certifications
8. Rejection clause: Defective items will be rejected and replacement must be provided within 48 hours
9. ManufacturingOS reserves the right to reject any or all quotes without assigning reasons
10. Award decision is final and binding
11. Force majeure clause applies as per standard business practices
12. Any disputes will be subject to Mumbai jurisdiction`;

export default function AddRFQPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const defaultClosing = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<RFQFormData>({
    rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    title: '',
    category: '',
    linkedPR: '',
    issueDate: today,
    closingDate: defaultClosing,
    validityPeriod: 30,
    items: [],
    selectedVendors: [],
    commercialTerms: {
      paymentTerms: 'Net 30 days',
      deliveryTerms: 'Door Delivery',
      incoterms: 'EXW (Ex Works)',
      inspectionRequirements: 'Quality inspection required before acceptance',
    },
    evaluationCriteria: {
      price: 50,
      quality: 30,
      deliveryTime: 15,
      paymentTerms: 5,
    },
    termsAndConditions: termsTemplate,
    notesToVendors: '',
    attachments: [],
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsLoadingVendors(true);
    MasterDataService.getVendors().then((liveVendors) => {
      if (liveVendors.length > 0) {
        setVendors(
          liveVendors.map((v: MDVendor, idx: number) => ({
            id: v.id,
            vendorId: v.vendorCode || v.id,
            vendorName: mdLabel.vendor(v),
            category: v.category || '',
            email: v.email || '',
            phone: '',
            rating: 0,
            pastPerformance: '',
            selected: false,
          }))
        );
      }
    }).finally(() => setIsLoadingVendors(false));
  }, []);

  const updateFormData = (field: keyof RFQFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
      if (errors.items) {
        setErrors(prev => ({ ...prev, items: '' }));
      }
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
    if (errors.selectedVendors) {
      setErrors(prev => ({ ...prev, selectedVendors: '' }));
    }
  };

  const loadFromPR = (prId: string) => {
    // Mock loading items from PR
    const mockItems: RFQItem[] = [
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
    ];
    updateFormData('items', mockItems);
    updateFormData('linkedPR', prId);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.closingDate) newErrors.closingDate = 'Closing date is required';

    const category = categories.find(c => c.value === formData.category);
    if (category) {
      const issueDate = new Date(formData.issueDate);
      const closingDate = new Date(formData.closingDate);
      const daysDiff = Math.ceil((closingDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < category.minDays) {
        newErrors.closingDate = `Closing date must be at least ${category.minDays} days from issue date for ${category.label}`;
      }
    }

    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    if (formData.selectedVendors.length < 3) newErrors.selectedVendors = 'Minimum 3 vendors required';
    if (formData.selectedVendors.length > 10) newErrors.selectedVendors = 'Maximum 10 vendors allowed';

    const evaluationTotal = Object.values(formData.evaluationCriteria).reduce((sum, val) => sum + val, 0);
    if (evaluationTotal !== 100) newErrors.evaluationCriteria = 'Evaluation criteria must total 100%';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const buildPayload = (): CreateRFQDto => ({
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
  });

  const handleSaveDraft = async () => {
    try {
      await procurementRFQService.createRFQ(buildPayload());
    } catch (err) {
      console.error('Error saving RFQ draft:', err);
    }
    router.push('/rfq');
  };

  const handleIssueRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fix all errors before issuing RFQ');
      return;
    }
    try {
      await procurementRFQService.createRFQ(buildPayload());
      router.push('/rfq');
    } catch (err) {
      console.error('Error issuing RFQ:', err);
      alert('Failed to issue RFQ');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push('/rfq');
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.vendorName.toLowerCase().includes(vendorFilter.toLowerCase()) ||
      v.category.toLowerCase().includes(vendorFilter.toLowerCase());
    const matchesCategory = !categoryFilter || v.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesRating = v.rating >= ratingFilter;
    return matchesSearch && matchesCategory && matchesRating;
  });

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
          <span className="font-medium">Back to RFQs</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">New Request for Quotation</h1>
              <p className="text-sm text-gray-600">Auto-generated RFQ Number: <span className="font-semibold text-blue-600">{formData.rfqNumber}</span></p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save as Draft</span>
              </button>
              <button
                type="button"
                onClick={handleIssueRFQ}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Issue RFQ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleIssueRFQ} className="space-y-3">
        {/* RFQ Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            RFQ Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFQ Title & Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter descriptive title for this RFQ (minimum 10 characters)"
                required
                minLength={10}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Purchase Requisition (Optional)
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.linkedPR}
                  onChange={(e) => loadFromPR(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select PR to load items</option>
                  {mockPRs.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.id} - {pr.title} ({pr.itemCount} items)
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Load items automatically from an existing PR</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Defaults to today</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.closingDate}
                onChange={(e) => updateFormData('closingDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.closingDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                min={formData.issueDate}
              />
              {errors.closingDate ? (
                <p className="text-xs text-red-500 mt-1">{errors.closingDate}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.category && categories.find(c => c.value === formData.category)?.minDays &&
                    `Minimum ${categories.find(c => c.value === formData.category)?.minDays} days required for ${categories.find(c => c.value === formData.category)?.label}`
                  }
                </p>
              )}
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
                max="90"
              />
              <p className="text-xs text-gray-500 mt-1">How long quotes remain valid (1-90 days)</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            Line Items with Full Specifications <span className="text-red-500 ml-1">*</span>
            <span className="ml-3 text-sm font-normal text-gray-600">({formData.items.length} items)</span>
          </h2>

          {errors.items && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.items}
            </div>
          )}

          {/* Existing Items */}
          {formData.items.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Item {index + 1}</h4>
                      <p className="text-xs text-gray-600 mt-1">{item.itemCode} - {item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Quantity</p>
                      <p className="font-semibold text-gray-900">{item.quantity} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Target Price</p>
                      <p className="font-semibold text-gray-900">{item.targetPrice ? formatCurrency(item.targetPrice) : 'Not set'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-gray-500">Specifications</p>
                      <p className="text-xs text-gray-700">{item.specifications || 'No specifications'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Item */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 bg-blue-50">
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Add New Item
            </h4>

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Item code"
                  />
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

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target Price (Optional)</label>
                  <input
                    type="number"
                    value={newItem.targetPrice}
                    onChange={(e) => setNewItem({ ...newItem, targetPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Technical Specifications</label>
                  <textarea
                    value={newItem.specifications}
                    onChange={(e) => setNewItem({ ...newItem, specifications: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed technical specifications, brand preferences, quality requirements..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!newItem.itemCode || !newItem.description || !newItem.quantity}
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Selection Wizard */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-600" />
              Vendor Selection Wizard <span className="text-red-500 ml-1">*</span>
              <span className="ml-3 text-sm font-normal text-gray-600">
                ({formData.selectedVendors.length} selected - Min: 3, Max: 10)
              </span>
              {isLoadingVendors && <span className="ml-3 text-xs text-gray-400">Loading…</span>}
            </h2>
            <button
              type="button"
              onClick={() => setShowVendorDetails(!showVendorDetails)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showVendorDetails ? 'Hide' : 'Show'} Past Performance
            </button>
          </div>

          {errors.selectedVendors && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.selectedVendors}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="relative">
              <input
                type="text"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by vendor name..."
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Filter by category...</option>
                <option value="spare">Spare Parts</option>
                <option value="raw">Raw Materials</option>
                <option value="hardware">Hardware</option>
                <option value="consumables">Consumables</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-gray-700">{ratingFilter}+ stars</span>
            </div>
          </div>

          {/* Vendor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => toggleVendor(vendor.id)}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  formData.selectedVendors.includes(vendor.id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                    <label className="ml-2 font-bold text-gray-900 text-sm">{vendor.vendorName}</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold text-gray-700">{vendor.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-2">{vendor.category}</p>

                <div className="space-y-1 mb-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <Mail className="h-3 w-3 mr-1" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="h-3 w-3 mr-1" />
                    {vendor.phone}
                  </div>
                </div>

                {showVendorDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Past Performance:</p>
                    <p className="text-xs text-gray-600">{vendor.pastPerformance}</p>
                  </div>
                )}
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

        {/* Evaluation Criteria Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            Evaluation Criteria Configuration (Weighted Scoring)
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
              <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold ${evaluationTotal === 100 ? 'text-green-700' : 'text-red-700'}`}>
                  Total: {evaluationTotal}%
                </p>
                {evaluationTotal === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              {evaluationTotal !== 100 && (
                <p className="text-xs text-red-600 mt-1">Criteria must total exactly 100%</p>
              )}
            </div>
          </div>
        </div>

        {/* Terms & Conditions Templates */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileSignature className="h-6 w-6 mr-2 text-blue-600" />
            Terms & Conditions
          </h2>
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">Standard terms template loaded. Modify as needed.</p>
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
            placeholder="Special instructions, priorities, or additional requirements for vendors..."
          />
        </div>

        {/* Technical Specifications Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-blue-600" />
            Technical Drawings/Specifications Upload
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Upload technical drawings, specifications, CAD files, or reference documents</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-2">Supported: PDF, DWG, DXF, JPG, PNG, DOC, XLS (Max 25MB each)</p>
          </div>
        </div>

        {/* Email Template Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Mail className="h-6 w-6 mr-2 text-blue-600" />
              Email Template Preview
            </h2>
            <button
              type="button"
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showEmailPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {showEmailPreview && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Subject: {formData.title} - RFQ {formData.rfqNumber}</p>
              <div className="text-sm text-gray-700 space-y-2">
                <p>Dear Vendor,</p>
                <p>We invite you to submit a quotation for the following items:</p>
                <p className="font-semibold">{formData.title}</p>
                <ul className="list-disc list-inside ml-4">
                  <li>RFQ Number: {formData.rfqNumber}</li>
                  <li>Closing Date: {formData.closingDate}</li>
                  <li>Number of Items: {formData.items.length}</li>
                </ul>
                <p>Please review the attached specifications and submit your quote before the closing date.</p>
                <p>Best regards,<br />ManufacturingOS Procurement Team</p>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Auto-notification will be sent to all selected vendors upon RFQ issuance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Review all fields before issuing RFQ. Email will be sent to {formData.selectedVendors.length} vendors.
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
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                <Save className="h-5 w-5" />
                <span>Save as Draft</span>
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Send className="h-5 w-5" />
                <span>Issue RFQ</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
