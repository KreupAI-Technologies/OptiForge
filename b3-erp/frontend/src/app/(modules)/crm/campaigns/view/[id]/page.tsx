'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Users, TrendingUp, Target, Calendar, DollarSign, BarChart3, Play, Pause, CheckCircle, ExternalLink, Clock, Activity } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'webinar' | 'content' | 'event';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  audience: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  owner: string;
  description?: string;
  goals?: string[];
  channels?: string[];
}

export default function CampaignViewPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.campaigns.getById(campaignId);
        if (!cancelled) {
          const allowedTypes = ['email', 'social', 'webinar', 'content', 'event'];
          const rawType = String((data as any)?.type ?? '').toLowerCase();
          const mappedType = (allowedTypes.includes(rawType) ? rawType : 'email') as Campaign['type'];

          const allowedStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed'];
          const rawStatus = String((data as any)?.status ?? '').toLowerCase();
          const mappedStatus = (allowedStatuses.includes(rawStatus) ? rawStatus : 'draft') as Campaign['status'];

          const mapped: Campaign = {
            id: String((data as any)?.id ?? campaignId),
            name: (data as any)?.name ?? '',
            type: mappedType,
            status: mappedStatus,
            startDate: (data as any)?.startDate ?? '',
            endDate: (data as any)?.endDate ?? undefined,
            budget: Number((data as any)?.budget ?? 0),
            spent: Number((data as any)?.actualCost ?? 0),
            audience: Number((data as any)?.totalLeads ?? 0),
            sent: Number((data as any)?.totalLeads ?? 0),
            delivered: Number((data as any)?.totalLeads ?? 0),
            opened: 0,
            clicked: 0,
            converted: Number((data as any)?.convertedLeads ?? 0),
            revenue: Number((data as any)?.actualRevenue ?? 0),
            owner: (data as any)?.assignedToName ?? '',
            description: (data as any)?.description ?? undefined,
            goals: (data as any)?.objective ? [String((data as any).objective)] : [],
            channels: Array.isArray((data as any)?.tags) ? (data as any).tags.map((t: any) => String(t)) : [],
          };
          setCampaign(mapped);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (!isLoading && !loadError && !campaign) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-2">The campaign you're looking for doesn't exist.</p>
          <Link href="/crm/campaigns" className="text-blue-600 hover:underline">
            Return to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || loadError || !campaign) {
    return (
      <div className="p-8">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-orange-100 text-orange-700';
      case 'social':
        return 'bg-blue-100 text-blue-700';
      case 'webinar':
        return 'bg-purple-100 text-purple-700';
      case 'content':
        return 'bg-green-100 text-green-700';
      case 'event':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      case 'webinar':
        return <Activity className="w-5 h-5" />;
      case 'content':
        return <BarChart3 className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const calculateROI = (revenue: number, spent: number) => {
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  };

  const calculateRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return 0;
    return (numerator / denominator) * 100;
  };

  const handleEdit = () => {
    router.push(`/crm/campaigns/edit/${campaign.id}`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await crmService.campaigns.delete(campaignId);
    } catch {
      // Navigate back regardless; server-side deletion failure is surfaced elsewhere
    } finally {
      setShowDeleteDialog(false);
      router.push('/crm/campaigns');
    }
  };

  const handleStatusToggle = async () => {
    if (!campaign) return;
    const nextStatus: Campaign['status'] =
      campaign.status === 'active' ? 'paused' : campaign.status === 'paused' ? 'active' : campaign.status;
    if (nextStatus === campaign.status) return;
    // Optimistic update
    setCampaign((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    try {
      await crmService.campaigns.update(campaignId, { status: nextStatus } as any);
    } catch {
      // Revert on failure
      setCampaign((prev) => (prev ? { ...prev, status: campaign.status } : prev));
    }
  };

  const roi = calculateROI(campaign.revenue, campaign.spent);
  const deliveryRate = calculateRate(campaign.delivered, campaign.sent);
  const openRate = calculateRate(campaign.opened, campaign.delivered);
  const clickRate = calculateRate(campaign.clicked, campaign.opened);
  const conversionRate = calculateRate(campaign.converted, campaign.clicked);
  const budgetUsed = (campaign.spent / campaign.budget) * 100;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${getStatusColor(campaign.status)}`}>
                {campaign.status === 'active' && <CheckCircle className="w-4 h-4" />}
                {campaign.status === 'paused' && <Pause className="w-4 h-4" />}
                {campaign.status === 'scheduled' && <Clock className="w-4 h-4" />}
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getTypeColor(campaign.type)}`}>
                {getTypeIcon(campaign.type)}
                {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
              </span>
            </div>
            <p className="text-gray-600">{campaign.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {(campaign.status === 'active' || campaign.status === 'paused') && (
              <button
                onClick={handleStatusToggle}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                  campaign.status === 'active'
                    ? 'border-yellow-300 text-yellow-600'
                    : 'border-green-300 text-green-600'
                }`}
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">${campaign.revenue.toLocaleString()}</p>
          <p className="text-sm text-blue-700 mt-1">ROI: {roi.toFixed(1)}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-900">Conversions</p>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{campaign.converted}</p>
          <p className="text-sm text-green-700 mt-1">Rate: {conversionRate.toFixed(1)}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-900">Audience Reached</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{campaign.audience.toLocaleString()}</p>
          <p className="text-sm text-purple-700 mt-1">Delivered: {campaign.delivered.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-900">Budget Used</p>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">${campaign.spent.toLocaleString()}</p>
          <p className="text-sm text-orange-700 mt-1">of ${campaign.budget.toLocaleString()} ({budgetUsed.toFixed(0)}%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Campaign Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Campaign Performance</h2>

            <div className="space-y-2">
              {/* Sent */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Sent</span>
                  <span className="text-sm font-semibold text-gray-900">{campaign.sent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Delivered */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Delivered</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.delivered.toLocaleString()} ({deliveryRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${deliveryRate}%` }}></div>
                </div>
              </div>

              {/* Opened */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Opened</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.opened.toLocaleString()} ({openRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${openRate}%` }}></div>
                </div>
              </div>

              {/* Clicked */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Clicked</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.clicked.toLocaleString()} ({clickRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${clickRate}%` }}></div>
                </div>
              </div>

              {/* Converted */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Converted</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.converted} ({conversionRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${conversionRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Goals */}
          {campaign.goals && campaign.goals.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Campaign Goals</h2>
              <ul className="space-y-3">
                {campaign.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Marketing Channels */}
          {campaign.channels && campaign.channels.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Marketing Channels</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.channels.map((channel, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Campaign Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Campaign Details</h2>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Campaign ID</p>
                <p className="text-sm font-medium text-gray-900">{campaign.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Campaign Type</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm ${getTypeColor(campaign.type)}`}>
                  {getTypeIcon(campaign.type)}
                  {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border ${getStatusColor(campaign.status)}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Campaign Owner</p>
                <p className="text-sm font-medium text-gray-900">{campaign.owner}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-900">{campaign.startDate}</p>
              </div>

              {campaign.endDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="text-sm font-medium text-gray-900">{campaign.endDate}</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Budget Information</h2>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                <p className="text-xl font-bold text-gray-900">${campaign.budget.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Amount Spent</p>
                <p className="text-xl font-bold text-blue-600">${campaign.spent.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Remaining</p>
                <p className="text-xl font-bold text-green-600">${(campaign.budget - campaign.spent).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Budget Usage</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{budgetUsed.toFixed(1)}% used</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
