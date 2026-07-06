'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { MasterDataService, MDCustomer, MDEmployee, mdLabel } from '@/services/master-data.service';
import { crmService } from '@/services/crm.service';

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  customer: string;
  customerCompany: string;
  contactPerson: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'negotiation';
  totalValue: number;
  sections: number;
  pages: number;
  submittedDate?: string;
  viewedDate?: string;
  respondedDate?: string;
  validUntil: string;
  probability: number;
  assignedTo: string;
  tags: string[];
  notes: string;
  attachments: number;
  lastActivity: string;
  createdDate: string;
}

export default function ProposalEditPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string;

  // The live proposal record (loaded from the API), used for read-only summary fields.
  const [existingProposal, setExistingProposal] = useState<Partial<Proposal> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live customer picker — initialized empty, filled on mount
  const [customers, setCustomers] = useState<MDCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Live employee picker for "Assigned To" — initialized empty, filled on mount
  const [employees, setEmployees] = useState<MDEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    setCustomersLoading(true);
    MasterDataService.getCustomers().then(live => {
      if (live.length > 0) setCustomers(live);
    }).finally(() => setCustomersLoading(false));

    setEmployeesLoading(true);
    MasterDataService.getEmployees().then(live => {
      if (live.length > 0) setEmployees(live);
    }).finally(() => setEmployeesLoading(false));
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    customerCompany: '',
    contactPerson: '',
    status: 'draft' as Proposal['status'],
    totalValue: 0,
    validUntil: '',
    probability: 50,
    assignedTo: '',
    notes: '',
  });

  const [tags, setTags] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch the real proposal record and prefill form.
  useEffect(() => {
    if (!proposalId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    crmService.proposals
      .getById(proposalId)
      .then((record: any) => {
        if (cancelled || !record || typeof record !== 'object') return;
        setExistingProposal(record);
        setFormData(prev => ({
          ...prev,
          title: record.title ?? prev.title,
          customerCompany: record.customerCompany ?? record.customerName ?? prev.customerCompany,
          contactPerson: record.contactPerson ?? prev.contactPerson,
          status: (record.status ?? prev.status) as Proposal['status'],
          totalValue: Number(record.totalValue ?? prev.totalValue),
          validUntil: (record.validUntil ?? prev.validUntil ?? '').toString().slice(0, 10),
          probability: Number(record.probability ?? prev.probability),
          assignedTo: record.assignedTo ?? record.assignedToName ?? prev.assignedTo,
          notes: record.notes ?? prev.notes,
        }));
        if (Array.isArray(record.tags) && record.tags.length > 0) setTags(record.tags);
      })
      .catch((err: any) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load proposal');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [proposalId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-blue-700">Loading proposal…</div>
    );
  }

  if (!existingProposal) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-2">
            {loadError ? loadError : "The proposal you're trying to edit doesn't exist."}
          </p>
          <Link href="/crm/proposals" className="text-blue-600 hover:underline">
            Return to Proposals
          </Link>
        </div>
      </div>
    );
  }

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
      await crmService.proposals.update(proposalId, payload);
      router.push(`/crm/proposals/view/${proposalId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update proposal');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Proposal</h1>
            <p className="text-gray-600 mt-1">{existingProposal.proposalNumber ?? proposalId}</p>
          </div>
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
                    <select
                      id="customerCompany"
                      value={formData.customerCompany}
                      onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.customerCompany ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={customersLoading}
                    >
                      <option value="">{customersLoading ? 'Loading customers…' : 'Select customer'}</option>
                      {customers.map(c => (
                        <option key={c.id} value={mdLabel.customer(c)}>{mdLabel.customer(c)}</option>
                      ))}
                      {/* Keep existing value selectable even if not yet in live list */}
                      {formData.customerCompany && !customers.find(c => mdLabel.customer(c) === formData.customerCompany) && (
                        <option value={formData.customerCompany}>{formData.customerCompany}</option>
                      )}
                    </select>
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
                    <select
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={employeesLoading}
                    >
                      <option value="">{employeesLoading ? 'Loading employees…' : 'Select assignee'}</option>
                      {employees.map(e => (
                        <option key={e.id} value={mdLabel.employee(e)}>{mdLabel.employee(e)}</option>
                      ))}
                      {/* Keep existing value selectable even if not yet in live list */}
                      {formData.assignedTo && !employees.find(e => mdLabel.employee(e) === formData.assignedTo) && (
                        <option value={formData.assignedTo}>{formData.assignedTo}</option>
                      )}
                    </select>
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
            {/* Proposal Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Proposal Summary</h2>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Proposal Number</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.proposalNumber ?? proposalId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {existingProposal.createdDate ? new Date(existingProposal.createdDate).toLocaleDateString() : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Sections</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.sections ?? 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Pages</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.pages ?? 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Attachments</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.attachments ?? 0} files</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Current Total Value</p>
                  <p className="text-2xl font-bold text-green-600">${formData.totalValue.toLocaleString()}</p>
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
                  <span>{saving ? 'Saving…' : 'Save Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
