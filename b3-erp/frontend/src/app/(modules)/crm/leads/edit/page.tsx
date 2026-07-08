'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface LeadEditForm {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  status: string;
  rating: string;
  leadSource: string;
  estimatedValue: string;
  probability: string;
  description: string;
}

const emptyForm: LeadEditForm = {
  firstName: '',
  lastName: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  industry: '',
  status: 'new',
  rating: 'warm',
  leadSource: '',
  estimatedValue: '',
  probability: '50',
  description: '',
};

/**
 * Lead edit entry-point (no route param).
 *
 * When a `?id=<leadId>` query param is present this renders a real edit form
 * that GETs the lead from the CRM leads endpoint and PATCHes updates back.
 * When no id is supplied it shows a hint and redirects to the leads list — the
 * per-record deep form also lives at /crm/leads/edit/[id].
 */
export default function EditLeadEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const leadId = searchParams.get('id') || '';

  const [form, setForm] = useState<LeadEditForm>(emptyForm);
  const [isLoading, setIsLoading] = useState<boolean>(!!leadId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // No id → redirect to list after a short delay.
  useEffect(() => {
    if (leadId) return;
    const timer = setTimeout(() => router.push('/crm/leads'), 3000);
    return () => clearTimeout(timer);
  }, [router, leadId]);

  // Prefill the form from the backend when an id is provided.
  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data: any = await crmService.leads.getById(leadId);
        if (!cancelled && data) {
          setForm({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            title: data.title ?? '',
            company: data.company ?? data.companyName ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            website: data.website ?? '',
            industry: data.industry ?? '',
            status: data.status ?? 'new',
            rating: data.rating ?? 'warm',
            leadSource: data.leadSource ?? data.source ?? '',
            estimatedValue: data.estimatedValue != null ? String(data.estimatedValue) : '',
            probability: data.probability != null ? String(data.probability) : '50',
            description: data.description ?? '',
          });
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load lead');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const update = (field: keyof LeadEditForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (isSubmitting || !leadId) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        title: form.title,
        company: form.company,
        email: form.email,
        phone: form.phone,
        website: form.website,
        industry: form.industry,
        status: form.status,
        rating: form.rating,
        leadSource: form.leadSource,
        estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : undefined,
        probability: form.probability ? parseInt(form.probability, 10) : undefined,
        description: form.description,
      };
      await crmService.leads.update(leadId, payload);
      addToast({
        title: 'Lead Updated',
        message: `${form.firstName} ${form.lastName} has been updated successfully`,
        variant: 'success',
      });
      router.push('/crm/leads');
    } catch (e) {
      addToast({
        title: 'Update Failed',
        message: e instanceof Error ? e.message : 'Failed to update lead. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- No id: show hint + auto-redirect ----
  if (!leadId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lead ID Required</h1>
          <p className="text-gray-600 mb-3">
            You need to specify which lead to edit. Please select a lead from the list.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/crm/leads')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Leads List
            </button>
            <p className="text-sm text-gray-500">Redirecting automatically in 3 seconds...</p>
          </div>
          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-left">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> To edit a specific lead, append{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">?id=&lt;leadId&gt;</code> to this URL,
              or use{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">/crm/leads/edit/[id]</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- With id: real edit form (GET + PATCH) ----
  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-3xl mx-auto">
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
            <p className="text-sm text-gray-600">Update lead information — ID: {leadId}</p>
          </div>
        </div>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading lead…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="First Name" value={form.firstName} onChange={v => update('firstName', v)} />
              <Field label="Last Name" value={form.lastName} onChange={v => update('lastName', v)} />
              <Field label="Job Title" value={form.title} onChange={v => update('title', v)} />
              <Field label="Company" value={form.company} onChange={v => update('company', v)} />
              <Field label="Email" type="email" value={form.email} onChange={v => update('email', v)} />
              <Field label="Phone" value={form.phone} onChange={v => update('phone', v)} />
              <Field label="Website" value={form.website} onChange={v => update('website', v)} />
              <Field label="Industry" value={form.industry} onChange={v => update('industry', v)} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={e => update('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={form.rating}
                  onChange={e => update('rating', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>

              <Field label="Lead Source" value={form.leadSource} onChange={v => update('leadSource', v)} />
              <Field
                label="Estimated Value"
                type="number"
                value={form.estimatedValue}
                onChange={v => update('estimatedValue', v)}
              />
              <Field
                label="Probability (%)"
                type="number"
                value={form.probability}
                onChange={v => update('probability', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description / Notes</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <button
                onClick={() => router.push('/crm/leads')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Updating…' : 'Update Lead'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
