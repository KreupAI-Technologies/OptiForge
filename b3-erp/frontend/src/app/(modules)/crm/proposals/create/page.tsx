'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { crmService } from '@/services/crm.service';

export default function ProposalCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    customerCompany: '',
    contactPerson: '',
    status: 'draft' as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'negotiation',
    totalValue: 0,
    validUntil: '',
    probability: 50,
    assignedTo: '',
    notes: '',
  });

  const [tags, setTags] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Proposal title is required';
    }

    if (!formData.customerCompany.trim()) {
      newErrors.customerCompany = 'Customer company is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (formData.totalValue <= 0) {
      newErrors.totalValue = 'Total value must be greater than 0';
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        title: formData.title,
        customerCompany: formData.customerCompany,
        contactPerson: formData.contactPerson,
        status: formData.status,
        totalValue: formData.totalValue,
        validUntil: formData.validUntil,
        probability: formData.probability,
        assignedTo: formData.assignedTo,
        notes: formData.notes,
        tags: tags.filter((t) => t.trim()),
      };
      await crmService.proposals.create(payload);
      router.push('/crm/proposals');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create proposal');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/crm/proposals');
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-3">
        <Link href="/crm/proposals" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Proposal</h1>
          <p className="text-gray-600 mt-1">Fill in the details to create a new proposal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-3">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>

              <div className="space-y-2">
                {/* Proposal Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Proposal Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter proposal title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Customer Company */}
                  <div>
                    <label htmlFor="customerCompany" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Company *
                    </label>
                    <input
                      type="text"
                      id="customerCompany"
                      value={formData.customerCompany}
                      onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.customerCompany ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter customer company"
                    />
                    {errors.customerCompany && (
                      <p className="text-sm text-red-600 mt-1">{errors.customerCompany}</p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter contact person"
                    />
                    {errors.contactPerson && (
                      <p className="text-sm text-red-600 mt-1">{errors.contactPerson}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      id="validUntil"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.validUntil ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.validUntil && (
                      <p className="text-sm text-red-600 mt-1">{errors.validUntil}</p>
                    )}
                  </div>

                  {/* Win Probability */}
                  <div>
                    <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-1">
                      Win Probability (%)
                    </label>
                    <input
                      type="number"
                      id="probability"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Total Value */}
                  <div>
                    <label htmlFor="totalValue" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Value ($) *
                    </label>
                    <input
                      type="number"
                      id="totalValue"
                      min="0"
                      value={formData.totalValue}
                      onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.totalValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.totalValue && (
                      <p className="text-sm text-red-600 mt-1">{errors.totalValue}</p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To *
                    </label>
                    <input
                      type="text"
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter assigned person"
                    />
                    {errors.assignedTo && (
                      <p className="text-sm text-red-600 mt-1">{errors.assignedTo}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter internal notes"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Tag
                </button>
              </div>

              <div className="space-y-3">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tag"
                    />
                    {tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Info</h2>

              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900 font-medium mb-2">💡 Tip</p>
                  <p className="text-xs text-blue-700">
                    Start with a draft status and add all necessary details before sending to the customer.
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Total Value</p>
                  <p className="text-2xl font-bold text-green-600">${formData.totalValue.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Win Probability</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${formData.probability}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formData.probability}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="space-y-3">
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Creating…' : 'Create Proposal'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  * Required fields must be filled before creating the proposal
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
