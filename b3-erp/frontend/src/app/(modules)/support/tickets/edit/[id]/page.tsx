'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Ticket, Save } from 'lucide-react';
import { getTicketById, updateTicket, type SupportTicket } from '@/services/support-management.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

interface FormState {
  subject: string;
  description: string;
  priority: SupportTicket['priority'];
  status: SupportTicket['status'];
  channel: SupportTicket['channel'];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  resolution: string;
  tags: string;
}

export default function TicketEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const t = await getTicketById(params.id, COMPANY_ID);
        if (!t) throw new Error('Ticket not found');
        if (!cancelled) {
          setTicketNumber(t.ticketNumber || '');
          setForm({
            subject: t.subject || '',
            description: t.description || '',
            priority: t.priority || 'medium',
            status: t.status || 'new',
            channel: t.channel || 'email',
            customerName: t.customerName || '',
            customerEmail: t.customerEmail || '',
            customerPhone: t.customerPhone || '',
            resolution: t.resolution || '',
            tags: Array.isArray(t.tags) ? t.tags.join(', ') : '',
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateTicket(params.id, COMPANY_ID, {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        status: form.status,
        channel: form.channel,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        resolution: form.resolution || undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      router.push('/support/tickets');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save ticket');
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="w-full min-h-screen px-3 py-2 max-w-3xl">
      <div className="mb-4">
        <button
          onClick={() => router.push('/support/tickets')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </button>
      </div>

      <h1 className="mb-4 text-xl font-semibold text-gray-900">
        Edit Ticket {ticketNumber && <span className="text-blue-600">{ticketNumber}</span>}
      </h1>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
        </div>
      )}

      {loadError && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center">
          <Ticket className="h-10 w-10 text-gray-300" />
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" /> {loadError}
          </p>
        </div>
      )}

      {!isLoading && !loadError && form && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}

          <div>
            <label className={labelCls}>Subject</label>
            <input type="text" value={form.subject} onChange={(e) => update('subject', e.target.value)} className={inputCls} required />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls}>Priority</label>
              <select value={form.priority} onChange={(e) => update('priority', e.target.value as FormState['priority'])} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value as FormState['status'])} className={inputCls}>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="reopened">Reopened</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Channel</label>
              <select value={form.channel} onChange={(e) => update('channel', e.target.value as FormState['channel'])} className={inputCls}>
                <option value="email">Email</option>
                <option value="chat">Chat</option>
                <option value="phone">Phone</option>
                <option value="web">Web</option>
                <option value="social">Social</option>
                <option value="portal">Portal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls}>Customer Name</label>
              <input type="text" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Customer Email</label>
              <input type="email" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Customer Phone</label>
              <input type="text" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Resolution</label>
            <textarea value={form.resolution} onChange={(e) => update('resolution', e.target.value)} rows={3} className={inputCls} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => router.push('/support/tickets')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
