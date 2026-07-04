'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { MasterDataService, MDCustomer, MDEmployee, mdLabel, fetchRecordById } from '@/services/master-data.service';

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

const mockProposalsSeed: Proposal[] = [
  {
    id: '1',
    proposalNumber: 'PROP-2024-001',
    title: 'Enterprise Digital Transformation Initiative',
    customer: 'John Smith',
    customerCompany: 'Acme Corporation',
    contactPerson: 'John Smith - CTO',
    status: 'negotiation',
    totalValue: 450000,
    sections: 8,
    pages: 42,
    submittedDate: '2024-10-10',
    viewedDate: '2024-10-11',
    respondedDate: '2024-10-15',
    validUntil: '2024-11-10',
    probability: 75,
    assignedTo: 'Sarah Johnson',
    tags: ['Enterprise', 'Digital Transformation', 'Strategic'],
    notes: 'Follow-up meeting scheduled for next week to discuss pricing adjustments.',
    attachments: 5,
    lastActivity: '2024-10-18',
    createdDate: '2024-10-05',
  },
  {
    id: '2',
    proposalNumber: 'PROP-2024-002',
    title: 'Cloud Infrastructure Migration Services',
    customer: 'Emily Davis',
    customerCompany: 'TechStart Inc',
    contactPerson: 'Emily Davis - VP Engineering',
    status: 'sent',
    totalValue: 125000,
    sections: 6,
    pages: 28,
    submittedDate: '2024-10-15',
    viewedDate: '2024-10-16',
    validUntil: '2024-11-15',
    probability: 60,
    assignedTo: 'Michael Chen',
    tags: ['Cloud', 'Migration', 'Infrastructure'],
    notes: 'Waiting for technical review by their infrastructure team.',
    attachments: 3,
    lastActivity: '2024-10-17',
    createdDate: '2024-10-12',
  },
  {
    id: '3',
    proposalNumber: 'PROP-2024-003',
    title: 'Annual Support & Maintenance Contract',
    customer: 'Robert Johnson',
    customerCompany: 'Global Industries Ltd',
    contactPerson: 'Robert Johnson - IT Director',
    status: 'accepted',
    totalValue: 85000,
    sections: 4,
    pages: 15,
    submittedDate: '2024-09-25',
    viewedDate: '2024-09-26',
    respondedDate: '2024-10-02',
    validUntil: '2024-10-25',
    probability: 100,
    assignedTo: 'Sarah Johnson',
    tags: ['Support', 'Maintenance', 'Renewal'],
    notes: 'Accepted! Contract execution in progress.',
    attachments: 2,
    lastActivity: '2024-10-02',
    createdDate: '2024-09-20',
  },
  {
    id: '4',
    proposalNumber: 'PROP-2024-004',
    title: 'Custom ERP Implementation',
    customer: 'Lisa Anderson',
    customerCompany: 'Manufacturing Solutions Co',
    contactPerson: 'Lisa Anderson - COO',
    status: 'viewed',
    totalValue: 320000,
    sections: 10,
    pages: 55,
    submittedDate: '2024-10-08',
    viewedDate: '2024-10-09',
    validUntil: '2024-11-08',
    probability: 65,
    assignedTo: 'David Park',
    tags: ['ERP', 'Custom', 'Manufacturing'],
    notes: 'Proposal viewed multiple times. Awaiting decision from executive team.',
    attachments: 8,
    lastActivity: '2024-10-14',
    createdDate: '2024-10-01',
  },
  {
    id: '5',
    proposalNumber: 'PROP-2024-005',
    title: 'Cybersecurity Assessment & Implementation',
    customer: 'James Wilson',
    customerCompany: 'Financial Services Group',
    contactPerson: 'James Wilson - CISO',
    status: 'rejected',
    totalValue: 95000,
    sections: 5,
    pages: 22,
    submittedDate: '2024-09-15',
    viewedDate: '2024-09-16',
    respondedDate: '2024-09-28',
    validUntil: '2024-10-15',
    probability: 0,
    assignedTo: 'Michael Chen',
    tags: ['Security', 'Compliance', 'Assessment'],
    notes: 'Rejected due to budget constraints. Consider re-engagement in Q1 2025.',
    attachments: 4,
    lastActivity: '2024-09-28',
    createdDate: '2024-09-10',
  },
  {
    id: '6',
    proposalNumber: 'PROP-2024-006',
    title: 'Mobile App Development - iOS & Android',
    customer: 'Maria Garcia',
    customerCompany: 'Retail Innovations',
    contactPerson: 'Maria Garcia - Product Manager',
    status: 'draft',
    totalValue: 180000,
    sections: 7,
    pages: 35,
    validUntil: '2024-11-20',
    probability: 50,
    assignedTo: 'Sarah Johnson',
    tags: ['Mobile', 'iOS', 'Android', 'Development'],
    notes: 'Draft in progress. Waiting for final requirements from client.',
    attachments: 2,
    lastActivity: '2024-10-19',
    createdDate: '2024-10-15',
  },
  {
    id: '7',
    proposalNumber: 'PROP-2024-007',
    title: 'Data Analytics Platform Implementation',
    customer: 'Thomas Brown',
    customerCompany: 'Healthcare Systems Inc',
    contactPerson: 'Thomas Brown - Data Officer',
    status: 'expired',
    totalValue: 275000,
    sections: 9,
    pages: 48,
    submittedDate: '2024-08-15',
    viewedDate: '2024-08-16',
    validUntil: '2024-09-15',
    probability: 40,
    assignedTo: 'David Park',
    tags: ['Analytics', 'Healthcare', 'Data'],
    notes: 'Proposal expired. Client requested extension but project put on hold.',
    attachments: 6,
    lastActivity: '2024-09-20',
    createdDate: '2024-08-10',
  },
];

export default function ProposalEditPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string;

  const existingProposal = mockProposalsSeed.find(p => p.id === proposalId);

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
    title: existingProposal?.title || '',
    customerCompany: existingProposal?.customerCompany || '',
    contactPerson: existingProposal?.contactPerson || '',
    status: existingProposal?.status || 'draft',
    totalValue: existingProposal?.totalValue || 0,
    validUntil: existingProposal?.validUntil || '',
    probability: existingProposal?.probability || 50,
    assignedTo: existingProposal?.assignedTo || '',
    notes: existingProposal?.notes || '',
  });

  const [tags, setTags] = useState<string[]>(existingProposal?.tags || ['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch the real proposal record and prefill form if found
  useEffect(() => {
    if (!proposalId) return;
    fetchRecordById<Partial<Proposal>>('/crm/proposals', proposalId).then(record => {
      if (!record) return;
      setFormData(prev => ({
        ...prev,
        title: record.title ?? prev.title,
        customerCompany: record.customerCompany ?? prev.customerCompany,
        contactPerson: record.contactPerson ?? prev.contactPerson,
        status: record.status ?? prev.status,
        totalValue: record.totalValue ?? prev.totalValue,
        validUntil: record.validUntil ?? prev.validUntil,
        probability: record.probability ?? prev.probability,
        assignedTo: record.assignedTo ?? prev.assignedTo,
        notes: record.notes ?? prev.notes,
      }));
      if (record.tags && record.tags.length > 0) setTags(record.tags);
    });
  }, [proposalId]);

  if (!existingProposal) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-2">The proposal you're trying to edit doesn't exist.</p>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      router.push(`/crm/proposals/view/${proposalId}`);
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
            <p className="text-gray-600 mt-1">{existingProposal.proposalNumber}</p>
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
                  <p className="text-sm font-medium text-gray-900">{existingProposal.proposalNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(existingProposal.createdDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Sections</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.sections}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Pages</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.pages}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Attachments</p>
                  <p className="text-sm font-medium text-gray-900">{existingProposal.attachments} files</p>
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
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
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
