'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { crmService } from '@/services/crm.service';

const toDateInput = (v: any): string => (v ? String(v).split('T')[0] : '');

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params?.id as string;

  const [formData, setFormData] = useState({
    title: '',
    contractNumber: '',
    customerCompany: '',
    customer: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    type: 'license' as 'service' | 'subscription' | 'license' | 'support' | 'maintenance' | 'custom',
    status: 'active' as 'draft' | 'active' | 'pending_renewal' | 'expired' | 'terminated' | 'suspended',
    value: '',
    recurringValue: '',
    billingCycle: 'annually' as 'monthly' | 'quarterly' | 'annually' | 'one-time',
    startDate: '',
    endDate: '',
    signedDate: '',
    autoRenew: true,
    renewalNoticeDays: '',
    paymentTerms: '',
    assignedTo: '',
    notes: '',
    termsAndConditions: '',
  });

  const [tags, setTags] = useState<string[]>(['']);
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({
    totalInvoiced: 0,
    outstandingAmount: 0,
    createdDate: '',
  });

  useEffect(() => {
    if (!contractId) return;
    let active = true;
    (async () => {
      try {
        const c: any = await crmService.contracts.getById(contractId);
        if (!active || !c) return;
        setFormData({
          title: c.title ?? '',
          contractNumber: c.contractNumber ?? '',
          customerCompany: c.customerCompany ?? c.customerName ?? '',
          customer: c.customer ?? c.contactPerson ?? '',
          customerEmail: c.customerEmail ?? '',
          customerPhone: c.customerPhone ?? '',
          customerAddress: c.customerAddress ?? '',
          type: (c.type ?? c.category ?? 'license'),
          status: (c.status ?? 'active'),
          value: c.value != null ? String(c.value) : '',
          recurringValue: c.recurringValue != null ? String(c.recurringValue) : '',
          billingCycle: (c.billingCycle ?? 'annually'),
          startDate: toDateInput(c.startDate),
          endDate: toDateInput(c.endDate),
          signedDate: toDateInput(c.signedDate),
          autoRenew: Boolean(c.autoRenew),
          renewalNoticeDays: c.renewalNoticeDays != null ? String(c.renewalNoticeDays) : '',
          paymentTerms: c.paymentTerms ?? '',
          assignedTo: c.assignedTo ?? '',
          notes: c.notes ?? '',
          termsAndConditions: c.termsAndConditions ?? '',
        });
        setTags(Array.isArray(c.tags) && c.tags.length ? c.tags : ['']);
        setDeliverables(Array.isArray(c.deliverables) && c.deliverables.length ? c.deliverables : ['']);
        setStats({
          totalInvoiced: Number(c.totalInvoiced ?? 0),
          outstandingAmount: Number(c.outstandingAmount ?? 0),
          createdDate: toDateInput(c.createdDate) || c.createdDate || '',
        });
      } catch (err) {
        console.error('Failed to load contract', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [contractId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.contractNumber.trim()) newErrors.contractNumber = 'Contract number is required';
    if (!formData.customerCompany.trim()) newErrors.customerCompany = 'Customer company is required';
    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.value) newErrors.value = 'Contract value is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.paymentTerms.trim()) newErrors.paymentTerms = 'Payment terms are required';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'Assignment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        contractNumber: formData.contractNumber,
        customerCompany: formData.customerCompany,
        customer: formData.customer,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        type: formData.type,
        category: formData.type,
        status: formData.status,
        value: formData.value ? parseFloat(formData.value) : 0,
        recurringValue: formData.recurringValue ? parseFloat(formData.recurringValue) : 0,
        billingCycle: formData.billingCycle,
        startDate: formData.startDate,
        endDate: formData.endDate,
        signedDate: formData.signedDate || undefined,
        autoRenew: formData.autoRenew,
        renewalNoticeDays: formData.renewalNoticeDays ? parseInt(formData.renewalNoticeDays) : 0,
        paymentTerms: formData.paymentTerms,
        assignedTo: formData.assignedTo,
        notes: formData.notes,
        termsAndConditions: formData.termsAndConditions,
        tags: tags.filter((t) => t.trim()),
        deliverables: deliverables.filter((d) => d.trim()),
      };
      await crmService.contracts.update(contractId, payload);
      router.push('/crm/contracts');
    } catch (err) {
      console.error('Failed to update contract', err);
      setSubmitting(false);
    }
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const updateDeliverable = (index: number, value: string) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = value;
    setDeliverables(newDeliverables);
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contract
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Contract</h1>
          <p className="text-gray-600 mt-2">Update contract information and terms</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-3">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contract Number *
                      </label>
                      <input
                        type="text"
                        value={formData.contractNumber}
                        onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.contractNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="CNT-2024-001"
                      />
                      {errors.contractNumber && <p className="text-red-600 text-sm mt-1">{errors.contractNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="pending_renewal">Pending Renewal</option>
                        <option value="expired">Expired</option>
                        <option value="terminated">Terminated</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Enterprise Software License Agreement"
                    />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="service">Service</option>
                      <option value="subscription">Subscription</option>
                      <option value="license">License</option>
                      <option value="support">Support</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customerCompany}
                        onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.customerCompany ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Acme Corporation"
                      />
                      {errors.customerCompany && <p className="text-red-600 text-sm mt-1">{errors.customerCompany}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.customer ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Smith"
                      />
                      {errors.customer && <p className="text-red-600 text-sm mt-1">{errors.customer}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Business St, San Francisco, CA 94105"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Financial Details</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Contract Value * ($)
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        min="0"
                        step="100"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.value ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="450000"
                      />
                      {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurring Value ($)
                      </label>
                      <input
                        type="number"
                        value={formData.recurringValue}
                        onChange={(e) => setFormData({ ...formData, recurringValue: e.target.value })}
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="90000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Cycle
                      </label>
                      <select
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                        <option value="one-time">One-Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Terms *
                      </label>
                      <input
                        type="text"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.paymentTerms ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Net 30"
                      />
                      {errors.paymentTerms && <p className="text-red-600 text-sm mt-1">{errors.paymentTerms}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Period */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contract Period</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Signed Date
                      </label>
                      <input
                        type="date"
                        value={formData.signedDate}
                        onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Renewal Notice (days)
                      </label>
                      <input
                        type="number"
                        value={formData.renewalNoticeDays}
                        onChange={(e) => setFormData({ ...formData, renewalNoticeDays: e.target.value })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="90"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.autoRenew}
                          onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Auto-renew contract</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignment</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To *
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Sarah Johnson"
                  />
                  {errors.assignedTo && <p className="text-red-600 text-sm mt-1">{errors.assignedTo}</p>}
                </div>
              </div>

              {/* Deliverables */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Deliverables & Services</h2>
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Deliverable
                  </button>
                </div>
                <div className="space-y-3">
                  {deliverables.map((deliverable, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={deliverable}
                        onChange={(e) => updateDeliverable(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 24/7 premium support"
                      />
                      {deliverables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeliverable(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>
                <textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the terms and conditions of the contract..."
                />
              </div>

              {/* Internal Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Internal notes about the contract..."
                />
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tag
                  </button>
                </div>
                <div className="space-y-3">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Enterprise"
                      />
                      {tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Current Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Status</h3>
                <div className="space-y-2">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Invoiced</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      ${(stats.totalInvoiced / 1000).toFixed(0)}K
                    </div>
                  </div>

                  <div className={`bg-gradient-to-br rounded-lg p-3 ${
                    stats.outstandingAmount > 0 ? 'from-red-50 to-red-100' : 'from-gray-50 to-gray-100'
                  }`}>
                    <div className={`flex items-center gap-2 mb-1 ${
                      stats.outstandingAmount > 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Outstanding</span>
                    </div>
                    <div className={`text-2xl font-bold ${
                      stats.outstandingAmount > 0 ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      ${(stats.outstandingAmount / 1000).toFixed(1)}K
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Created</div>
                    <div className="text-gray-900">
                      {new Date(stats.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Summary</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Value</div>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {formData.value ? `$${(parseInt(formData.value) / 1000).toFixed(0)}K` : '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Recurring Value</div>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {formData.recurringValue ? `$${(parseInt(formData.recurringValue) / 1000).toFixed(0)}K` : '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contract Type</div>
                    <div className="text-gray-900 capitalize">
                      {formData.type}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="text-gray-900 capitalize">
                      {formData.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
