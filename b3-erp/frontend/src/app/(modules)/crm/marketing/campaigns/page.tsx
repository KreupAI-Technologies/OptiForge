'use client';

import { useState, useEffect, useCallback } from 'react';
import { crmService, asArray } from '@/services/crm.service';
import {
  Mail, Search, Plus, Eye, Edit, Copy, Trash2, Play, Pause,
  BarChart3, TrendingUp, Users, Target, Calendar, Clock,
  Send, CheckCircle, XCircle, DollarSign, Activity,
  Filter, Settings, Tag, MoreVertical, ArrowUpRight,
  Zap, List, GitBranch, MousePointer, StopCircle,
  AlertCircle, RefreshCw, Download, Upload, Layers
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'multi-channel' | 'drip' | 'event-based';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  description: string;
  startDate: string;
  endDate: string;
  targetAudience: {
    segments: string[];
    lists: string[];
    totalContacts: number;
  };
  budget: number;
  spent: number;
  stages: CampaignStage[];
  metrics: {
    reach: number;
    delivered: number;
    opened: number;
    clicked: number;
    conversions: number;
    revenue: number;
    engagement: number;
  };
  goals: {
    type: string;
    target: number;
    current: number;
  }[];
  owner: string;
  createdAt: string;
  tags: string[];
}

interface CampaignStage {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed';
  completionDate?: string;
}


function mapCampaign(c: any): Campaign {
  return {
    id: String(c?.id ?? ''),
    name: c?.name ?? '',
    type: (c?.type ?? 'email') as Campaign['type'],
    status: (c?.status ?? 'draft') as Campaign['status'],
    description: c?.description ?? '',
    startDate: c?.startDate ?? '',
    endDate: c?.endDate ?? '',
    targetAudience: {
      segments: Array.isArray(c?.targetAudience?.segments) ? c.targetAudience.segments : [],
      lists: Array.isArray(c?.targetAudience?.lists) ? c.targetAudience.lists : [],
      totalContacts: Number(c?.targetAudience?.totalContacts ?? 0),
    },
    budget: Number(c?.budget ?? 0),
    spent: Number(c?.spent ?? 0),
    stages: Array.isArray(c?.stages) ? c.stages : [],
    metrics: {
      reach: Number(c?.metrics?.reach ?? 0),
      delivered: Number(c?.metrics?.delivered ?? 0),
      opened: Number(c?.metrics?.opened ?? 0),
      clicked: Number(c?.metrics?.clicked ?? 0),
      conversions: Number(c?.metrics?.conversions ?? 0),
      revenue: Number(c?.metrics?.revenue ?? 0),
      engagement: Number(c?.metrics?.engagement ?? 0),
    },
    goals: Array.isArray(c?.goals)
      ? c.goals.map((g: any) => ({
          type: g?.type ?? '',
          target: Number(g?.target ?? 0),
          current: Number(g?.current ?? 0),
        }))
      : [],
    owner: c?.owner ?? '',
    createdAt: c?.createdAt ?? '',
    tags: Array.isArray(c?.tags) ? c.tags : [],
  };
}

export default function MarketingCampaignsPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const loadCampaigns = useCallback(async () => {
    try {
      const data = await crmService.marketingCampaigns.getAll();
      setCampaigns(asArray(data).map(mapCampaign));
    } catch {
      setCampaigns([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.marketingCampaigns.getAll();
        if (!active) return;
        setCampaigns(asArray(data).map(mapCampaign));
      } catch {
        if (active) setCampaigns([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Campaign['type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Campaign['status']>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || campaign.type === filterType;
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'running').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalReach: campaigns.reduce((sum, c) => sum + c.metrics.reach, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0),
    avgEngagement: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.metrics.engagement, 0) / campaigns.length
      : 0
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-orange-100 text-orange-700';
      case 'multi-channel': return 'bg-purple-100 text-purple-700';
      case 'drip': return 'bg-blue-100 text-blue-700';
      case 'event-based': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateROI = (revenue: number, spent: number) => {
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  };

  const handleCreateCampaign = async () => {
    try {
      await crmService.marketingCampaigns.create({
        name: 'New Campaign',
        type: 'email',
        status: 'draft',
      } as any);
      await loadCampaigns();
      addToast({
        title: 'Campaign Created',
        message: 'New marketing campaign created successfully',
        variant: 'success'
      });
    } catch {
      addToast({
        title: 'Create Failed',
        message: 'Could not create campaign',
        variant: 'error'
      });
    }
  };

  const handleCloneCampaign = async (campaign: Campaign) => {
    try {
      await crmService.marketingCampaigns.create({
        name: `${campaign.name} (Copy)`,
        type: campaign.type,
        status: 'draft',
        description: campaign.description,
        budget: campaign.budget,
        tags: campaign.tags,
      } as any);
      await loadCampaigns();
      addToast({
        title: 'Campaign Cloned',
        message: `"${campaign.name}" has been cloned successfully`,
        variant: 'success'
      });
    } catch {
      addToast({
        title: 'Clone Failed',
        message: 'Could not clone campaign',
        variant: 'error'
      });
    }
  };

  const updateCampaignStatus = async (
    campaign: Campaign,
    status: Campaign['status'],
    toast: { title: string; message: string; variant: any }
  ) => {
    try {
      await crmService.marketingCampaigns.update(campaign.id, { status } as any);
      await loadCampaigns();
      addToast(toast);
    } catch {
      addToast({ title: 'Update Failed', message: `Could not update "${campaign.name}"`, variant: 'error' });
    }
  };

  const handlePauseCampaign = (campaign: Campaign) =>
    updateCampaignStatus(campaign, 'paused', {
      title: 'Campaign Paused',
      message: `"${campaign.name}" has been paused`,
      variant: 'warning'
    });

  const handleResumeCampaign = (campaign: Campaign) =>
    updateCampaignStatus(campaign, 'running', {
      title: 'Campaign Resumed',
      message: `"${campaign.name}" is now running`,
      variant: 'success'
    });

  const handleStopCampaign = (campaign: Campaign) =>
    updateCampaignStatus(campaign, 'completed', {
      title: 'Campaign Stopped',
      message: `"${campaign.name}" has been stopped`,
      variant: 'info'
    });

  const handleDeleteCampaign = async (campaign: Campaign) => {
    try {
      await crmService.marketingCampaigns.delete(campaign.id);
      await loadCampaigns();
      addToast({
        title: 'Campaign Deleted',
        message: `"${campaign.name}" has been deleted`,
        variant: 'success'
      });
    } catch {
      addToast({
        title: 'Delete Failed',
        message: `Could not delete "${campaign.name}"`,
        variant: 'error'
      });
    }
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Builder</h1>
          <p className="text-sm text-gray-600 mt-1">Create, manage, and optimize marketing campaigns</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalCampaigns}</div>
          <div className="text-blue-100 text-sm">Campaigns</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Play className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activeCampaigns}</div>
          <div className="text-green-100 text-sm">Active</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{(stats.totalReach / 1000).toFixed(1)}K</div>
          <div className="text-purple-100 text-sm">Total Reach</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.avgEngagement.toFixed(1)}%</div>
          <div className="text-orange-100 text-sm">Engagement</div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalConversions}</div>
          <div className="text-teal-100 text-sm">Conversions</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">${(stats.totalRevenue / 1000000).toFixed(2)}M</div>
          <div className="text-pink-100 text-sm">Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">${(stats.totalBudget / 1000).toFixed(0)}K</div>
          <div className="text-indigo-100 text-sm">Budget</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{((stats.totalSpent / stats.totalBudget) * 100).toFixed(0)}%</div>
          <div className="text-cyan-100 text-sm">Budget Used</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="multi-channel">Multi-channel</option>
              <option value="drip">Drip</option>
              <option value="event-based">Event-based</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-2">
        {filteredCampaigns.map(campaign => {
          const roi = calculateROI(campaign.metrics.revenue, campaign.spent);
          const budgetUsed = (campaign.spent / campaign.budget) * 100;
          const openRate = campaign.metrics.delivered > 0 ? (campaign.metrics.opened / campaign.metrics.delivered) * 100 : 0;
          const clickRate = campaign.metrics.delivered > 0 ? (campaign.metrics.clicked / campaign.metrics.delivered) * 100 : 0;
          const conversionRate = campaign.metrics.delivered > 0 ? (campaign.metrics.conversions / campaign.metrics.delivered) * 100 : 0;

          return (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Campaign Header */}
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
                    <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {campaign.startDate} - {campaign.endDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.targetAudience.totalContacts.toLocaleString()} contacts
                      </div>
                      <div>Owner: {campaign.owner}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {campaign.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleCloneCampaign(campaign)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    {campaign.status === 'running' && (
                      <button
                        onClick={() => handlePauseCampaign(campaign)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-yellow-300 rounded-lg hover:bg-yellow-50 text-sm"
                      >
                        <Pause className="w-4 h-4 text-yellow-600" />
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button
                        onClick={() => handleResumeCampaign(campaign)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                      >
                        <Play className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    {(campaign.status === 'running' || campaign.status === 'paused') && (
                      <button
                        onClick={() => handleStopCampaign(campaign)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                      >
                        <StopCircle className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Campaign Stages */}
                <div className="mb-2 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Campaign Stages
                    </h4>
                    <span className="text-xs text-gray-500">
                      {campaign.stages.filter(s => s.status === 'completed').length} of {campaign.stages.length} completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.stages.map((stage, index) => (
                      <div key={stage.id} className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          {getStageStatusIcon(stage.status)}
                          <span className={`text-xs ${stage.status === 'completed' ? 'text-green-700 font-medium' : stage.status === 'in-progress' ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                            {stage.name}
                          </span>
                        </div>
                        {index < campaign.stages.length - 1 && (
                          <div className={`h-1 rounded ${stage.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-6 gap-3 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-blue-600 mb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-xs">Reach</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">{campaign.metrics.reach.toLocaleString()}</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-green-600 mb-1">
                      <Eye className="w-3 h-3" />
                      <span className="text-xs">Open Rate</span>
                    </div>
                    <div className="text-lg font-bold text-green-900">{openRate.toFixed(1)}%</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-purple-600 mb-1">
                      <MousePointer className="w-3 h-3" />
                      <span className="text-xs">Click Rate</span>
                    </div>
                    <div className="text-lg font-bold text-purple-900">{clickRate.toFixed(1)}%</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-orange-600 mb-1">
                      <Target className="w-3 h-3" />
                      <span className="text-xs">Conv Rate</span>
                    </div>
                    <div className="text-lg font-bold text-orange-900">{conversionRate.toFixed(1)}%</div>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-teal-600 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-xs">Revenue</span>
                    </div>
                    <div className="text-lg font-bold text-teal-900">${(campaign.metrics.revenue / 1000).toFixed(0)}K</div>
                  </div>

                  <div className="bg-pink-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-pink-600 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">ROI</span>
                    </div>
                    <div className={`text-lg font-bold ${roi >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {roi.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Goals Progress */}
                <div className="mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Campaign Goals</h4>
                  <div className="space-y-2">
                    {campaign.goals.map((goal, index) => {
                      const progress = (goal.current / goal.target) * 100;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{goal.type}</span>
                            <span className="font-medium text-gray-900">
                              {goal.type.includes('Rate') || goal.type.includes('Engagement')
                                ? `${goal.current.toFixed(1)}%`
                                : goal.current.toLocaleString()
                              } / {goal.type.includes('Rate') || goal.type.includes('Engagement')
                                ? `${goal.target}%`
                                : goal.target.toLocaleString()
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                progress >= 100 ? 'bg-green-600' :
                                progress >= 75 ? 'bg-blue-600' :
                                progress >= 50 ? 'bg-yellow-600' :
                                'bg-orange-600'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Budget Progress</span>
                    <span className="font-medium text-gray-900">
                      ${(campaign.spent / 1000).toFixed(1)}K / ${(campaign.budget / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetUsed > 90 ? 'bg-red-600' :
                        budgetUsed > 75 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Detail Modal Placeholder */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCampaign.name}</h2>
                <p className="text-sm text-gray-600 mt-1">Campaign Flow Builder & Analytics</p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <GitBranch className="w-16 h-16 text-gray-400 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Campaign Flow Builder</h3>
                  <p className="text-gray-600 mb-2">Drag-and-drop interface for building campaign workflows</p>
                  <p className="text-sm text-gray-500">This would include: trigger nodes, action nodes, condition branches, delay timers, and analytics widgets</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Segments</h4>
                        <ul className="space-y-1">
                          {selectedCampaign.targetAudience.segments.map((segment, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              {segment}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Lists</h4>
                        <ul className="space-y-1">
                          {selectedCampaign.targetAudience.lists.map((list, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <List className="w-4 h-4 text-blue-600" />
                              {list}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {selectedCampaign.targetAudience.totalContacts.toLocaleString()} total contacts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
