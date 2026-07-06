'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Plus, X } from 'lucide-react';
import { crmService } from '@/services/crm.service';

export default function CreateTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerCompany: '',
    customer: '',
    contactEmail: '',
    contactPhone: '',
    status: 'open' as 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'technical' as 'technical' | 'billing' | 'feature_request' | 'bug' | 'access' | 'training' | 'other',
    assignedTo: '',
    relatedContract: '',
  });

  const [tags, setTags] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.customerCompany.trim()) newErrors.customerCompany = 'Customer company is required';
    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'Assignment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        subject: formData.subject,
        description: formData.description,
        customerCompany: formData.customerCompany,
        customer: formData.customer,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        status: formData.status,
        priority: formData.priority,
        category: formData.category,
        assignedTo: formData.assignedTo,
        relatedContract: formData.relatedContract || undefined,
        tags: tags.map((t) => t.trim()).filter(Boolean),
      };
      await crmService.tickets.create(payload);
      router.push('/crm/support/tickets');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create ticket. Please try again.');
      setIsSubmitting(false);
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
            Back to Tickets
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
          <p className="text-gray-600 mt-2">Log a new customer support request</p>
        </div>

        {submitError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-3">
              {/* Ticket Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Ticket Information</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Brief description of the issue"
                    />
                    {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Detailed description of the issue, steps to reproduce, etc."
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="bug">Bug</option>
                        <option value="access">Access</option>
                        <option value="training">Training</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
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
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john.smith@acme.com"
                      />
                      {errors.contactEmail && <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 555-0123"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment & Related Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignment & Related Info</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending_customer">Pending Customer</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related Contract
                    </label>
                    <input
                      type="text"
                      value={formData.relatedContract}
                      onChange={(e) => setFormData({ ...formData, relatedContract: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="CNT-2024-001"
                    />
                  </div>
                </div>
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
                        placeholder="e.g., Dashboard"
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
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating…' : 'Create Ticket'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Quick Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Ticket Tips</h3>
                    <p className="text-sm text-blue-700">
                      Provide clear subject and detailed description. Include steps to reproduce for bugs and technical issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket Summary</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Priority</div>
                    <div className="text-gray-900 capitalize font-medium">
                      {formData.priority}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Category</div>
                    <div className="text-gray-900 capitalize">
                      {formData.category.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="text-gray-900 capitalize">
                      {formData.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assigned To</div>
                    <div className="text-gray-900">
                      {formData.assignedTo || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Guidelines */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Guidelines</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-red-700">Critical</div>
                    <div className="text-gray-600">System down, major data loss</div>
                  </div>
                  <div>
                    <div className="font-medium text-orange-700">High</div>
                    <div className="text-gray-600">Significant impact on operations</div>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-700">Medium</div>
                    <div className="text-gray-600">Moderate impact, workaround exists</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Low</div>
                    <div className="text-gray-600">Minor issues, enhancements</div>
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
