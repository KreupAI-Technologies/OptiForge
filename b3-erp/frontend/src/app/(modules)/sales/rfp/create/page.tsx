'use client';

import React, { useState, useEffect } from 'react';
import { MasterDataService, MDVendor } from '@/services/master-data.service';
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  FileText,
  Users,
  Building,
  Mail,
  Phone,
  Upload,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Paperclip
} from 'lucide-react';

interface RFPItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string;
  targetPrice?: number;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  phone: string;
}

export default function CreateRFPPage() {
  const availableVendorsSeed: Vendor[] = [
    {
      id: '1',
      name: 'Tata Steel Limited',
      email: 'sales@tatasteel.com',
      contactPerson: 'Rajesh Kumar',
      phone: '+91 98765 43210'
    },
    {
      id: '2',
      name: 'JSW Steel',
      email: 'business@jswsteel.in',
      contactPerson: 'Amit Sharma',
      phone: '+91 98765 43211'
    },
    {
      id: '3',
      name: 'Hindalco Industries',
      email: 'procurement@hindalco.com',
      contactPerson: 'Priya Patel',
      phone: '+91 98765 43212'
    },
    {
      id: '4',
      name: 'Bharat Forge',
      email: 'sales@bharatforge.com',
      contactPerson: 'Vikram Singh',
      phone: '+91 98765 43213'
    },
    {
      id: '5',
      name: 'L&T Heavy Engineering',
      email: 'rfp@lntheavy.com',
      contactPerson: 'Suresh Menon',
      phone: '+91 98765 43214'
    },
    {
      id: '6',
      name: 'Thermax Limited',
      email: 'business@thermaxglobal.com',
      contactPerson: 'Neha Desai',
      phone: '+91 98765 43215'
    }
  ];

  const [availableVendors, setAvailableVendors] = useState<Vendor[]>(availableVendorsSeed);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  const [rfpTitle, setRfpTitle] = useState('');
  const [rfpDescription, setRfpDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('manufacturing');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  const [items, setItems] = useState<RFPItem[]>([
    {
      id: '1',
      itemName: '',
      description: '',
      quantity: 0,
      unit: 'pieces',
      specifications: '',
      targetPrice: undefined
    }
  ]);

  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('');

  const availableVendors: Vendor[] = [
    {
      id: '1',
      name: 'Tata Steel Limited',
      email: 'sales@tatasteel.com',
      contactPerson: 'Rajesh Kumar',
      phone: '+91 98765 43210'
    },
    {
      id: '2',
      name: 'JSW Steel',
      email: 'business@jswsteel.in',
      contactPerson: 'Amit Sharma',
      phone: '+91 98765 43211'
    },
    {
      id: '3',
      name: 'Hindalco Industries',
      email: 'procurement@hindalco.com',
      contactPerson: 'Priya Patel',
      phone: '+91 98765 43212'
    },
    {
      id: '4',
      name: 'Bharat Forge',
      email: 'sales@bharatforge.com',
      contactPerson: 'Vikram Singh',
      phone: '+91 98765 43213'
    },
    {
      id: '5',
      name: 'L&T Heavy Engineering',
      email: 'rfp@lntheavy.com',
      contactPerson: 'Suresh Menon',
      phone: '+91 98765 43214'
    },
    {
      id: '6',
      name: 'Thermax Limited',
      email: 'business@thermaxglobal.com',
      contactPerson: 'Neha Desai',
      phone: '+91 98765 43215'
    }
  ];

  const addItem = () => {
    const newItem: RFPItem = {
      id: Date.now().toString(),
      itemName: '',
      description: '',
      quantity: 0,
      unit: 'pieces',
      specifications: '',
      targetPrice: undefined
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof RFPItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleVendor = (vendorId: string) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 px-3 py-2">
      <div className="space-y-3">
        {/* Inline Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Preview
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send RFP
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-3">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                RFP Basic Information
              </h2>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RFP Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rfpTitle}
                    onChange={(e) => setRfpTitle(e.target.value)}
                    placeholder="e.g., Industrial Machinery Components Manufacturing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rfpDescription}
                    onChange={(e) => setRfpDescription(e.target.value)}
                    placeholder="Provide detailed description of the requirements..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="manufacturing">Manufacturing</option>
                      <option value="raw_materials">Raw Materials</option>
                      <option value="machinery">Machinery</option>
                      <option value="components">Components</option>
                      <option value="services">Services</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'urgent')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Items/Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Items & Requirements
                </h2>
                <button
                  onClick={addItem}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                          placeholder="e.g., CNC Machined Components"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Detailed description..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="pieces">Pieces</option>
                          <option value="kg">Kilograms</option>
                          <option value="tons">Tons</option>
                          <option value="meters">Meters</option>
                          <option value="liters">Liters</option>
                          <option value="boxes">Boxes</option>
                          <option value="sets">Sets</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Technical Specifications
                        </label>
                        <textarea
                          value={item.specifications}
                          onChange={(e) => updateItem(item.id, 'specifications', e.target.value)}
                          placeholder="Technical specifications, standards, certifications required..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Price (₹) <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          value={item.targetPrice || ''}
                          onChange={(e) => updateItem(item.id, 'targetPrice', parseFloat(e.target.value) || undefined)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Terms & Conditions
              </h2>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <textarea
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g., 30% advance, 70% on delivery..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Terms
                  </label>
                  <textarea
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    placeholder="e.g., FOB, CIF, delivery location, expected timeline..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Criteria
                  </label>
                  <textarea
                    value={evaluationCriteria}
                    onChange={(e) => setEvaluationCriteria(e.target.value)}
                    placeholder="e.g., Price (40%), Quality (30%), Delivery Time (20%), Past Performance (10%)..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-purple-600" />
                Attachments
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PDF, DOC, XLS, images (max 10MB each)</p>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                      <button className="text-red-600 hover:text-red-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vendor Selection - Right Column */}
          <div className="space-y-3">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-3 text-white">
              <h3 className="text-lg font-semibold mb-2">RFP Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Total Items</span>
                  <span className="font-bold text-xl">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Selected Vendors</span>
                  <span className="font-bold text-xl">{selectedVendors.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Priority</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)} bg-white`}>
                    {priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Select Vendors
              </h2>

              <div className="space-y-3">
                {availableVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => toggleVendor(vendor.id)}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedVendors.includes(vendor.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedVendors.includes(vendor.id)
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedVendors.includes(vendor.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">{vendor.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{vendor.contactPerson}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{vendor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{vendor.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedVendors.length === 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Please select at least one vendor to send the RFP.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Provide clear and detailed specifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Set realistic response deadlines (min 7 days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Include evaluation criteria for transparency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Attach technical drawings or samples if needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
