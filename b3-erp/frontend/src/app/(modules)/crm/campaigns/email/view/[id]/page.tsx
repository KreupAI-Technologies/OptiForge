'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Send, Eye, Target, Calendar, AlertCircle } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  audience: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  scheduledDate?: string;
  sentDate?: string;
  template: string;
  from: string;
}

export default function EmailCampaignViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const c = (await crmService.emailCampaigns.getById(params.id)) as any;
        if (cancelled) return;
        if (!c || !c.id) {
          setCampaign(null);
          return;
        }
        setCampaign({
          id: String(c.id),
          name: c.name ?? '',
          subject: c.subject ?? '',
          status: c.status ?? 'draft',
          audience: Number(c.audience ?? 0),
          sent: Number(c.sent ?? 0),
          delivered: Number(c.delivered ?? 0),
          opened: Number(c.opened ?? 0),
          clicked: Number(c.clicked ?? 0),
          bounced: Number(c.bounced ?? 0),
          unsubscribed: Number(c.unsubscribed ?? 0),
          scheduledDate: c.scheduledDate ?? undefined,
          sentDate: c.sentDate ?? undefined,
          template: c.template ?? '',
          from: c.from ?? '',
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load campaign');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sending': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sent': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const openRate = campaign && campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0;
  const clickRate = campaign && campaign.sent > 0 ? (campaign.clicked / campaign.sent) * 100 : 0;
  const bounceRate = campaign && campaign.sent > 0 ? (campaign.bounced / campaign.sent) * 100 : 0;

  return (
    <div className="w-full h-full px-3 py-2 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/crm/campaigns/email')}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </button>
        {campaign && (
          <button
            onClick={() => router.push(`/crm/campaigns/email/edit/${campaign.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Campaign</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading campaign…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && !campaign && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Campaign not found.
        </div>
      )}

      {campaign && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">Subject: <span className="font-medium">{campaign.subject}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs text-gray-500">Template</p>
                <p className="font-medium text-gray-900">{campaign.template || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="font-medium text-gray-900">{campaign.from || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Scheduled</p>
                <p className="font-medium text-gray-900">
                  {campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sent</p>
                <p className="font-medium text-gray-900">
                  {campaign.sentDate ? new Date(campaign.sentDate).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
              <Send className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{campaign.sent.toLocaleString()}</div>
              <div className="text-blue-100">Sent</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
              <Eye className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{openRate.toFixed(1)}%</div>
              <div className="text-purple-100">Open Rate</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
              <Target className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{clickRate.toFixed(1)}%</div>
              <div className="text-orange-100">Click Rate</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Delivery Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 mb-1">Audience</div>
                <div className="text-lg font-bold text-blue-900">{campaign.audience.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 mb-1">Delivered</div>
                <div className="text-lg font-bold text-green-900">{campaign.delivered.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-xs text-red-600 mb-1">Bounce Rate</div>
                <div className="text-lg font-bold text-red-900">{bounceRate.toFixed(1)}%</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-xs text-yellow-600 mb-1">Unsubscribed</div>
                <div className="text-lg font-bold text-yellow-900">{campaign.unsubscribed}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
