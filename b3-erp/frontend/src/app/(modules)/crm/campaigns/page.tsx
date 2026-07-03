'use client';

import { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Target, Search, Plus, Calendar, BarChart3, Play, Pause, CheckCircle, XCircle, Clock, Eye, Edit, Copy, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (NestJS CrmCampaign) uses different field names than the page's
        // Campaign model; map defensively and coerce numeric metrics.
        const raw = (await crmService.campaigns.getAll()) as any[];
        const mapped: Campaign[] = (raw || []).map((c) => ({
          id: String(c.id),
          name: c.name ?? '',
          type: (c.type ?? 'email') as Campaign['type'],
          status: (c.status ?? 'draft') as Campaign['status'],
          startDate: c.startDate ?? '',
          endDate: c.endDate ?? undefined,
          budget: Number(c.budget ?? 0),
          spent: Number(c.actualCost ?? c.spent ?? 0),
          audience: Number(c.totalLeads ?? c.audience ?? 0),
          sent: Number(c.sent ?? 0),
          delivered: Number(c.delivered ?? 0),
          opened: Number(c.opened ?? 0),
          clicked: Number(c.clicked ?? 0),
          converted: Number(c.convertedLeads ?? c.converted ?? 0),
          revenue: Number(c.actualRevenue ?? c.revenue ?? 0),
          owner: c.assignedToName ?? c.owner ?? '',
        }));
        if (!cancelled) setCampaigns(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load campaigns');
          setCampaigns([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'email' | 'social' | 'webinar' | 'content' | 'event'>('all');
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalCampaigns: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    totalConverted: campaigns.reduce((sum, c) => sum + c.converted, 0),
  };

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

  const calculateROI = (revenue: number, spent: number) => {
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  };

  const handleViewCampaign = (campaign: Campaign) => {
    router.push(`/crm/campaigns/view/${campaign.id}`);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    router.push(`/crm/campaigns/edit/${campaign.id}`);
  };

  const handlePauseCampaign = (campaign: Campaign) => {
    setCampaigns(campaigns.map(c =>
      c.id === campaign.id ? { ...c, status: 'paused' } : c
    ));
  };

  const handleResumeCampaign = (campaign: Campaign) => {
    setCampaigns(campaigns.map(c =>
      c.id === campaign.id ? { ...c, status: 'active' } : c
    ));
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id));
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading campaigns…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && campaigns.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No campaigns found.
        </div>
      )}
      <div className="mb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalCampaigns}</div>
            <div className="text-blue-100">Total Campaigns</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.active}</div>
            <div className="text-green-100">Active</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">${(stats.totalBudget / 1000).toFixed(0)}K</div>
            <div className="text-purple-100">Total Budget</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">${(stats.totalSpent / 1000).toFixed(0)}K</div>
            <div className="text-orange-100">Total Spent</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalConverted}</div>
            <div className="text-teal-100">Conversions</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">${(stats.totalRevenue / 1000000).toFixed(2)}M</div>
            <div className="text-pink-100">Revenue</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <Link href="/crm/campaigns/email">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Mail className="w-8 h-8 text-orange-600" />
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Campaigns</h3>
              <p className="text-sm text-gray-600">Create and manage email campaigns</p>
            </div>
          </Link>

          <Link href="/crm/campaigns/performance">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-sm text-gray-600">View campaign analytics</p>
            </div>
          </Link>

          <Link href="/crm/campaigns/templates">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Copy className="w-8 h-8 text-purple-600" />
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
              <p className="text-sm text-gray-600">Manage email templates</p>
            </div>
          </Link>

          <Link href="/crm/campaigns/automation">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automation</h3>
              <p className="text-sm text-gray-600">Build automated workflows</p>
            </div>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="social">Social</option>
                <option value="webinar">Webinar</option>
                <option value="content">Content</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-2">
        {filteredCampaigns.map((campaign) => {
          const roi = calculateROI(campaign.revenue, campaign.spent);
          const openRate = campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0;
          const clickRate = campaign.sent > 0 ? (campaign.clicked / campaign.sent) * 100 : 0;
          const conversionRate = campaign.sent > 0 ? (campaign.converted / campaign.sent) * 100 : 0;

          return (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(campaign.type)}`}>
                      {campaign.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(campaign.startDate).toLocaleDateString()}
                      {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                    </div>
                    <div>Owner: <span className="font-medium">{campaign.owner}</span></div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 mb-1">Audience</div>
                      <div className="text-lg font-bold text-blue-900">{campaign.audience.toLocaleString()}</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 mb-1">Open Rate</div>
                      <div className="text-lg font-bold text-green-900">{openRate.toFixed(1)}%</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-purple-600 mb-1">Click Rate</div>
                      <div className="text-lg font-bold text-purple-900">{clickRate.toFixed(1)}%</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-xs text-orange-600 mb-1">Conversions</div>
                      <div className="text-lg font-bold text-orange-900">{campaign.converted}</div>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-3">
                      <div className="text-xs text-teal-600 mb-1">Revenue</div>
                      <div className="text-lg font-bold text-teal-900">${(campaign.revenue / 1000).toFixed(0)}K</div>
                    </div>

                    <div className="bg-pink-50 rounded-lg p-3">
                      <div className="text-xs text-pink-600 mb-1">ROI</div>
                      <div className={`text-lg font-bold ${roi >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {roi.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-600">Budget Progress</span>
                      <span className="font-medium text-gray-900">
                        ${(campaign.spent / 1000).toFixed(1)}K / ${(campaign.budget / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (campaign.spent / campaign.budget) * 100 > 90 ? 'bg-red-600' :
                          (campaign.spent / campaign.budget) * 100 > 75 ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewCampaign(campaign)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  {campaign.status === 'active' ? (
                    <button
                      onClick={() => handlePauseCampaign(campaign)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-yellow-300 rounded-lg hover:bg-yellow-50 text-sm"
                    >
                      <Pause className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-600">Pause</span>
                    </button>
                  ) : campaign.status === 'paused' ? (
                    <button
                      onClick={() => handleResumeCampaign(campaign)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Resume</span>
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDeleteCampaign(campaign)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      {campaignToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setCampaignToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Campaign"
          message={`Are you sure you want to delete "${campaignToDelete.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
