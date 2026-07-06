'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  Building2,
  DollarSign,
  Target,
  ShoppingCart,
  FileText,
  Plus,
  X,
  Calendar,
  Percent,
  Tag,
  Paperclip,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface OpportunityFormData {
  // Step 1: Basic Info
  name: string;
  account: string;
  contact: string;
  type: string;

  // Step 2: Opportunity Details
  amount: string;
  currency: string;
  probability: string;
  expectedCloseDate: string;
  stage: string;
  nextStep: string;
  leadSource: string;

  // Step 3: Products & Services
  productInterest: string[];
  customProducts: { product: string; quantity: string; unitPrice: string }[];

  // Step 4: Competition & Requirements
  competitors: string;
  customerRequirements: string;
  painPoints: string;
  decisionCriteria: string;
  timeline: string;

  // Step 5: Additional Info
  description: string;
  internalNotes: string;
  tags: string[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const kitchenProducts = [
  'Modular Kitchen Solutions',
  'Kitchen Cabinets & Storage',
  'Kitchen Countertops (Granite)',
  'Kitchen Countertops (Quartz)',
  'Kitchen Countertops (Solid Surface)',
  'Kitchen Appliances & Fittings',
  'Custom Kitchen Design & Planning',
  'Kitchen Hardware & Accessories',
  'Wardrobe & Closet Systems',
  'Vanity Units & Bathroom Cabinets',
  'Home Interior Woodwork',
  'Office Furniture & Cabinetry',
  'Commercial Kitchen Equipment',
  'Installation & After-Sales Service',
];

export default function AddOpportunityPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OpportunityFormData>({
    name: '',
    account: '',
    contact: '',
    type: 'new_business',
    amount: '',
    currency: 'USD',
    probability: '50',
    expectedCloseDate: '',
    stage: 'prospecting',
    nextStep: '',
    leadSource: '',
    productInterest: [],
    customProducts: [],
    competitors: '',
    customerRequirements: '',
    painPoints: '',
    decisionCriteria: '',
    timeline: '',
    description: '',
    internalNotes: '',
    tags: [],
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newTag, setNewTag] = useState('');

  const updateFormData = (field: keyof OpportunityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleProductInterest = (product: string) => {
    const current = formData.productInterest;
    if (current.includes(product)) {
      updateFormData('productInterest', current.filter(p => p !== product));
    } else {
      updateFormData('productInterest', [...current, product]);
    }
  };

  const addCustomProduct = () => {
    updateFormData('customProducts', [...formData.customProducts, { product: '', quantity: '1', unitPrice: '0' }]);
  };

  const updateCustomProduct = (index: number, field: string, value: string) => {
    const updated = [...formData.customProducts];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('customProducts', updated);
  };

  const removeCustomProduct = (index: number) => {
    updateFormData('customProducts', formData.customProducts.filter((_, i) => i !== index));
  };

  const calculateTotal = (quantity: string, unitPrice: string) => {
    return (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments(prev => [...prev, newAttachment]);
      });
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        name: formData.name,
        account: formData.account,
        customerName: formData.account,
        contactName: formData.contact,
        type: formData.type,
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency,
        probability: parseInt(formData.probability, 10) || 0,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        stage: formData.stage,
        nextStep: formData.nextStep,
        leadSource: formData.leadSource,
        productInterest: formData.productInterest,
        products: formData.customProducts.map(p => ({
          name: p.product,
          quantity: parseFloat(p.quantity) || 0,
          unitPrice: parseFloat(p.unitPrice) || 0,
        })),
        competitors: formData.competitors,
        customerRequirements: formData.customerRequirements,
        painPoints: formData.painPoints,
        decisionCriteria: formData.decisionCriteria,
        timeline: formData.timeline,
        description: formData.description,
        internalNotes: formData.internalNotes,
        tags: formData.tags,
      };
      await crmService.opportunities.create(payload);
      addToast({
        title: 'Opportunity Created',
        message: `${formData.name} has been created successfully`,
        variant: 'success'
      });
      router.push('/crm/opportunities');
    } catch (err) {
      addToast({
        title: 'Create Failed',
        message: err instanceof Error ? err.message : 'Could not create opportunity.',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: User },
    { id: 2, name: 'Opportunity Details', icon: Target },
    { id: 3, name: 'Products & Services', icon: ShoppingCart },
    { id: 4, name: 'Competition & Requirements', icon: Users },
    { id: 5, name: 'Additional Info', icon: FileText },
  ];

  return (
    <div className="w-full h-screen flex flex-col">
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Opportunity</h1>
                <p className="text-sm text-gray-600">Fill in the opportunity information</p>
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
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center space-x-3 ${
                        currentStep === step.id
                          ? 'text-blue-600'
                          : currentStep > step.id
                          ? 'text-green-600'
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

          {/* Form Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opportunity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Premium Kitchen Installation - Luxury Apartments"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account/Customer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.account}
                        onChange={(e) => updateFormData('account', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Select or enter account name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.contact}
                        onChange={(e) => updateFormData('contact', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Primary contact name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opportunity Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => updateFormData('type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new_business">New Business</option>
                      <option value="existing_business">Existing Business</option>
                      <option value="renewal">Renewal</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Opportunity Details */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Opportunity Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => updateFormData('amount', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="350000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateFormData('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Probability: {formData.probability}%
                    </label>
                    <div className="flex items-center space-x-3">
                      <Percent className="h-5 w-5 text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.probability}
                        onChange={(e) => updateFormData('probability', e.target.value)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Close Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) => updateFormData('expectedCloseDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => updateFormData('stage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="prospecting">Prospecting</option>
                      <option value="qualification">Qualification</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Step</label>
                    <input
                      type="text"
                      value={formData.nextStep}
                      onChange={(e) => updateFormData('nextStep', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Schedule product demo"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                    <select
                      value={formData.leadSource}
                      onChange={(e) => updateFormData('leadSource', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Lead Source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="trade_show">Trade Show</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="partner">Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Products & Services */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Products & Services</h2>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Interest (Kitchen Related)</h3>

                  {/* Selected Products */}
                  {formData.productInterest.length > 0 && (
                    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-3">Selected Products ({formData.productInterest.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.productInterest.map(product => (
                          <span
                            key={product}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                          >
                            {product}
                            <button
                              onClick={() => toggleProductInterest(product)}
                              className="ml-2 hover:text-blue-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Selection */}
                  <div className="border border-gray-300 rounded-lg p-3 max-h-80 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {kitchenProducts.map(product => (
                        <label key={product} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.productInterest.includes(product)}
                            onChange={() => toggleProductInterest(product)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{product}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Custom Products/Services with Pricing</h3>
                    <button
                      onClick={addCustomProduct}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {formData.customProducts.length > 0 && (
                    <div className="space-y-3">
                      {formData.customProducts.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="col-span-5">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product/Service</label>
                            <input
                              type="text"
                              value={item.product}
                              onChange={(e) => updateCustomProduct(index, 'product', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Product name"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCustomProduct(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="1"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateCustomProduct(index, 'unitPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Total</label>
                            <div className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-semibold text-gray-900">
                              ${calculateTotal(item.quantity, item.unitPrice).toLocaleString()}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <button
                              onClick={() => removeCustomProduct(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600">Grand Total</p>
                          <p className="text-2xl font-bold text-blue-900">
                            ${formData.customProducts.reduce((sum, item) => sum + calculateTotal(item.quantity, item.unitPrice), 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Competition & Requirements */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Competition & Requirements</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Competitors</label>
                    <textarea
                      value={formData.competitors}
                      onChange={(e) => updateFormData('competitors', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List competing companies or solutions being considered..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Requirements</label>
                    <textarea
                      value={formData.customerRequirements}
                      onChange={(e) => updateFormData('customerRequirements', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detailed customer requirements and specifications..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pain Points</label>
                    <textarea
                      value={formData.painPoints}
                      onChange={(e) => updateFormData('painPoints', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What problems is the customer trying to solve?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision Criteria</label>
                    <textarea
                      value={formData.decisionCriteria}
                      onChange={(e) => updateFormData('decisionCriteria', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What factors will influence their decision? (price, quality, timeline, etc.)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeline & Milestones</label>
                    <textarea
                      value={formData.timeline}
                      onChange={(e) => updateFormData('timeline', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Key dates and milestones in the decision process..."
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Additional Info */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="General description of the opportunity..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => updateFormData('internalNotes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Internal notes (not visible to customer)..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Paperclip className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop files
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, XLS, XLSX, images (Max 10MB each)
                      </p>
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={() => setCurrentStep(4)}
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

      {/* Fixed Footer with Save Button */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>Save Opportunity</span>
          </button>
        </div>
      </div>
    </div>
  );
}
