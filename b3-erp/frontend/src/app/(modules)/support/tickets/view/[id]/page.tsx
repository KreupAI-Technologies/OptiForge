'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, AlertCircle, Ticket, Mail, Phone, User, Calendar, Tag, MessageSquare } from 'lucide-react';
import { getTicketById, type SupportTicket } from '@/services/support-management.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  reopened: 'bg-red-100 text-red-700',
};

const titleCase = (v: string) =>
  (v || '').split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const fmtDate = (d: unknown) => (d ? String(d).slice(0, 10) : '—');

export default function TicketViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await getTicketById(params.id, COMPANY_ID);
        if (!cancelled) setTicket(res);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load ticket');
          setTicket(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="w-full min-h-screen px-3 py-2 max-w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/support/tickets')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </button>
        {ticket && (
          <button
            onClick={() => router.push(`/support/tickets/edit/${ticket.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-gray-100" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && !ticket && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center">
          <Ticket className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">Ticket not found</p>
          <p className="text-sm text-gray-500">The ticket you are looking for does not exist.</p>
        </div>
      )}

      {!isLoading && !loadError && ticket && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600">{ticket.ticketNumber}</div>
                <h1 className="mt-1 text-xl font-semibold text-gray-900">{ticket.subject}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status] || 'bg-gray-100 text-gray-700'}`}>
                  {titleCase(ticket.status)}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-700'}`}>
                  {titleCase(ticket.priority)}
                </span>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{ticket.description || '—'}</p>
            {Array.isArray(ticket.tags) && ticket.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {ticket.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Customer</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  {ticket.customerName || '—'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {ticket.customerEmail || '—'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {ticket.customerPhone || '—'}
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Details</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Channel</dt>
                  <dd className="text-gray-900">{titleCase(ticket.channel) || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Assignee</dt>
                  <dd className="text-gray-900">{ticket.assignee?.name || ticket.assigneeId || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">SLA Breached</dt>
                  <dd className="text-gray-900">{ticket.slaBreached ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1 text-gray-500"><Calendar className="h-3 w-3" /> Created</dt>
                  <dd className="text-gray-900">{fmtDate(ticket.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1 text-gray-500"><Calendar className="h-3 w-3" /> Updated</dt>
                  <dd className="text-gray-900">{fmtDate(ticket.updatedAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Resolved</dt>
                  <dd className="text-gray-900">{fmtDate(ticket.resolvedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {ticket.resolution && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MessageSquare className="h-4 w-4 text-gray-400" /> Resolution
              </h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{ticket.resolution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
