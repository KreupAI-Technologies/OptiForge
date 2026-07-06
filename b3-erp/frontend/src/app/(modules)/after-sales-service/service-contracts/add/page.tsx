'use client';

import React, { useState, useEffect } from 'react';
import { MasterDataService, mdLabel, MDCustomer } from '@/services/master-data.service';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Info
} from 'lucide-react';

interface ContractLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  frequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Annually';
  amount: number;
}

interface ContractContact {
  name: string;
  designation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export default function AddEditContractPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [contractType, setContractType] = useState<'AMC' | 'CMC' | 'Extended Warranty'>('AMC');
  const [contractNumber, setContractNumber] = useState('AMC-2025-AUTO');
  const [status, setStatus] = useState<'Draft' | 'Active' | 'Pending Approval'>('Draft');

  // Customer Details
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');

  // Contract Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [signedDate, setSignedDate] = useState('');

  // SLA Terms
  const [responseTimeSLA, setResponseTimeSLA] = useState('4');
  const [resolutionTimeSLA, setResolutionTimeSLA] = useState('24');
  const [coverageHours, setCoverageHours] = useState<'Business Hours' | '24x7' | 'Custom'>('Business Hours');
  const [customCoverageHours, setCustomCoverageHours] = useState('');

  // Financial Terms
  const [billingFrequency, setBillingFrequency] = useState<'One-time' | 'Monthly' | 'Quarterly' | 'Annually'>('Annually');
  const [paymentTerms, setPaymentTerms] = useState<'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Advance'>('Net 30');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [renewalNoticeDays, setRenewalNoticeDays] = useState('30');

  // Line Items
  const [lineItems, setLineItems] = useState<ContractLineItem[]>([
    {
      id: '1',
      description: 'Preventive Maintenance - Kitchen Equipment',
      quantity: 4,
      unitPrice: 5000,
      frequency: 'Quarterly',
      amount: 20000
    }
  ]);

  // Contacts
  const [contacts, setContacts] = useState<ContractContact[]>([
    {
      name: '',
      designation: '',
      phone: '',
      email: '',
      isPrimary: true
    }
  ]);

  // Additional Terms
  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [specialTerms, setSpecialTerms] = useState('');
  const [notes, setNotes] = useState('');

  const [mockCustomers, setMockCustomers] = useState<MDCustomer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    setLoadingCustomers(true);
    MasterDataService.getCustomers().then(live => {
      setMockCustomers(live);
    }).finally(() => setLoadingCustomers(false));
  }, []);

  const addLineItem = () => {
    const newItem: ContractLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      frequency: 'Annually',
      amount: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof ContractLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  const addContact = () => {
    setContacts([...contacts, {
      name: '',
      designation: '',
      phone: '',
      email: '',
      isPrimary: false
    }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof ContractContact, value: any) => {
    setContacts(contacts.map((contact, i) => {
      if (i === index) {
        return { ...contact, [field]: value };
      }
      return contact;
    }));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const totals = calculateTotals();
    const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
    const payload = {
      contractType,
      customerId: customerId || '',
      customerName: customerName || '',
      customerContactPerson: primaryContact?.name || undefined,
      customerEmail: primaryContact?.email || undefined,
      customerPhone: primaryContact?.phone || undefined,
      equipmentIds: [] as string[],
      coverageScope: coverageHours === 'Custom' ? customCoverageHours : coverageHours,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
      duration: 12,
      pricingTier: 'Standard',
      contractValue: Number(totals.total) || 0,
      currency: 'INR',
      billingFrequency,
      paymentTerms,
      responseTimeSLA: Number(responseTimeSLA) || 0,
      resolutionTimeSLA: Number(resolutionTimeSLA) || 0,
      visitFrequency: billingFrequency,
      serviceCoverage: [] as string[],
      inclusions: inclusions ? [inclusions] : [],
      exclusions: exclusions ? [exclusions] : [],
      partsIncluded: false,
      laborIncluded: true,
      consumablesIncluded: false,
      autoRenewal,
      notes: notes || undefined,
      createdBy: 'system',
    };

    try {
      await AfterSalesPagesService.createContract(payload);
      router.push('/after-sales-service/service-contracts');
    } catch (err) {
      console.error('Failed to create contract', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Service Contract</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new AMC/CMC service contract</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Contract'}
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type <span className="text-red-500">*</span>
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="AMC">AMC (Annual Maintenance Contract)</option>
                <option value="CMC">CMC (Comprehensive Maintenance Contract)</option>
                <option value="Extended Warranty">Extended Warranty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Number
              </label>
              <input
                type="text"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-generated"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Customer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={loadingCustomers ? 'Loading customers…' : 'Type to search customer...'}
                required
              />
              {customerName && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {mockCustomers
                    .filter(c => mdLabel.customer(c).toLowerCase().includes(customerName.toLowerCase()))
                    .map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setCustomerId(customer.id);
                          setCustomerName(mdLabel.customer(customer));
                          setCustomerGSTIN(customer.customerCode ?? '');
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900">{mdLabel.customer(customer)}</div>
                        <div className="text-xs text-gray-500">{customer.id}{customer.customerCode ? ` • ${customer.customerCode}` : ''}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <input
                type="text"
                value={customerId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={customerGSTIN}
                onChange={(e) => setCustomerGSTIN(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="29ABCDE1234F1Z5"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Enter complete service address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bangalore"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={customerState}
                onChange={(e) => setCustomerState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select State</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Delhi">Delhi</option>
                <option value="Telangana">Telangana</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerPincode}
                onChange={(e) => setCustomerPincode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="560001"
                required
              />
            </div>
          </div>
        </div>

        {/* Contract Period */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Contract Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed Date
              </label>
              <input
                type="date"
                value={signedDate}
                onChange={(e) => setSignedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SLA Terms */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">SLA Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Time SLA (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={responseTimeSLA}
                onChange={(e) => setResponseTimeSLA(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Time to acknowledge and respond to service request</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Time SLA (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={resolutionTimeSLA}
                onChange={(e) => setResolutionTimeSLA(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="24"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Time to completely resolve the service request</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Hours <span className="text-red-500">*</span>
              </label>
              <select
                value={coverageHours}
                onChange={(e) => setCoverageHours(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Business Hours">Business Hours (9 AM - 6 PM)</option>
                <option value="24x7">24x7 Support</option>
                <option value="Custom">Custom Hours</option>
              </select>
            </div>

            {coverageHours === 'Custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Coverage Hours
                </label>
                <input
                  type="text"
                  value={customCoverageHours}
                  onChange={(e) => setCustomCoverageHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mon-Sat 8 AM - 8 PM"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contract Line Items */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Contract Items & Pricing</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Service description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input
                      type="text"
                      value={item.amount.toLocaleString('en-IN')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-medium"
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Billing Frequency</label>
                  <select
                    value={item.frequency}
                    onChange={(e) => updateLineItem(item.id, 'frequency', e.target.value)}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="One-time">One-time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Total Contract Value:</span>
                  <span className="font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Frequency <span className="text-red-500">*</span>
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="One-time">One-time (Full Payment)</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Advance">Advance Payment</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
                className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Auto-Renewal</span>
            </label>

            {autoRenewal && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Notice Period:</label>
                <input
                  type="number"
                  value={renewalNoticeDays}
                  onChange={(e) => setRenewalNoticeDays(e.target.value)}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <span className="text-sm text-gray-700">days before expiry</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Contacts */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Customer Contacts</h2>
            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((contact, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Contact {index + 1}</span>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>
                    )}
                  </div>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact person name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={contact.designation}
                      onChange={(e) => updateContact(index, 'designation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Manager, Owner, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91-98765-43210"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contact.isPrimary}
                      onChange={(e) => updateContact(index, 'isPrimary', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">Set as primary contact</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions</label>
              <textarea
                value={inclusions}
                onChange={(e) => setInclusions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="List what is covered under this contract (e.g., parts, labor, preventive maintenance visits)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exclusions</label>
              <textarea
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="List what is NOT covered (e.g., consumables, damages due to misuse)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Terms</label>
              <textarea
                value={specialTerms}
                onChange={(e) => setSpecialTerms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any special conditions or clauses specific to this contract"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Internal notes (not visible to customer)"
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Contract Creation Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Ensure all required fields are filled accurately</li>
                <li>Verify customer details and service address before saving</li>
                <li>SLA terms will be used for ticket prioritization and tracking</li>
                <li>Contract can be edited until it's marked as Active</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving Contract...' : 'Save Contract'}
          </button>
        </div>
      </form>
    </div>
  );
}
