'use client';

import { useState, useEffect } from 'react';
import { crmService } from '@/services/crm.service';
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

const mockCampaigns: Campaign[] = [
  {
    id: 'CAM-001',
    name: 'Q4 Product Launch - Multi-Touch Campaign',
    type: 'multi-channel',
    status: 'running',
    description: 'Comprehensive product launch campaign across email, social, and events',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    targetAudience: {
      segments: ['Enterprise Clients', 'Mid-Market', 'Trial Users'],
      lists: ['Master Contact List', 'Product Interest - Manufacturing'],
      totalContacts: 12500
    },
    budget: 150000,
    spent: 87500,
    stages: [
      { id: 'STG-1', name: 'Awareness', order: 1, status: 'completed', completionDate: '2025-10-15' },
      { id: 'STG-2', name: 'Engagement', order: 2, status: 'in-progress' },
      { id: 'STG-3', name: 'Consideration', order: 3, status: 'pending' },
      { id: 'STG-4', name: 'Conversion', order: 4, status: 'pending' },
      { id: 'STG-5', name: 'Retention', order: 5, status: 'pending' }
    ],
    metrics: {
      reach: 12500,
      delivered: 11875,
      opened: 5938,
      clicked: 1781,
      conversions: 356,
      revenue: 1245000,
      engagement: 47.5
    },
    goals: [
      { type: 'Leads Generated', target: 500, current: 356 },
      { type: 'Revenue', target: 2000000, current: 1245000 },
      { type: 'Engagement Rate', target: 50, current: 47.5 }
    ],
    owner: 'Sarah Johnson',
    createdAt: '2025-09-15',
    tags: ['product-launch', 'q4', 'enterprise']
  },
  {
    id: 'CAM-002',
    name: 'Lead Nurture Drip - Manufacturing Solutions',
    type: 'drip',
    status: 'running',
    description: 'Automated 7-day nurture sequence for new manufacturing leads',
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    targetAudience: {
      segments: ['New Leads', 'Manufacturing Industry'],
      lists: ['Lead Capture Form - Website'],
      totalContacts: 3450
    },
    budget: 45000,
    spent: 28900,
    stages: [
      { id: 'STG-1', name: 'Welcome Email', order: 1, status: 'completed', completionDate: '2025-09-01' },
      { id: 'STG-2', name: 'Educational Content', order: 2, status: 'completed', completionDate: '2025-09-05' },
      { id: 'STG-3', name: 'Case Study', order: 3, status: 'in-progress' },
      { id: 'STG-4', name: 'Demo Offer', order: 4, status: 'pending' }
    ],
    metrics: {
      reach: 3450,
      delivered: 3312,
      opened: 1987,
      clicked: 794,
      conversions: 156,
      revenue: 624000,
      engagement: 60.0
    },
    goals: [
      { type: 'Qualified Leads', target: 200, current: 156 },
      { type: 'Demo Requests', target: 100, current: 78 },
      { type: 'Open Rate', target: 55, current: 60 }
    ],
    owner: 'Michael Chen',
    createdAt: '2025-08-20',
    tags: ['nurture', 'drip', 'manufacturing']
  },
  {
    id: 'CAM-003',
    name: 'Holiday Promotion 2025 - Email Blast',
    type: 'email',
    status: 'scheduled',
    description: 'Special holiday pricing and offers for existing customers',
    startDate: '2025-11-15',
    endDate: '2025-12-25',
    targetAudience: {
      segments: ['Active Customers', 'High Value Prospects'],
      lists: ['Customer Database', 'VIP List'],
      totalContacts: 25600
    },
    budget: 85000,
    spent: 12000,
    stages: [
      { id: 'STG-1', name: 'Pre-Launch Teaser', order: 1, status: 'pending' },
      { id: 'STG-2', name: 'Launch Day', order: 2, status: 'pending' },
      { id: 'STG-3', name: 'Mid-Campaign Push', order: 3, status: 'pending' },
      { id: 'STG-4', name: 'Last Chance', order: 4, status: 'pending' }
    ],
    metrics: {
      reach: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      conversions: 0,
      revenue: 0,
      engagement: 0
    },
    goals: [
      { type: 'Revenue', target: 1500000, current: 0 },
      { type: 'Conversion Rate', target: 8, current: 0 },
      { type: 'Order Volume', target: 500, current: 0 }
    ],
    owner: 'Emily Rodriguez',
    createdAt: '2025-10-01',
    tags: ['holiday', 'promotion', 'seasonal']
  },
  {
    id: 'CAM-004',
    name: 'Webinar Series - Industry Best Practices',
    type: 'event-based',
    status: 'running',
    description: 'Monthly webinar series with follow-up campaigns',
    startDate: '2025-08-01',
    endDate: '2025-12-31',
    targetAudience: {
      segments: ['Prospects', 'Customers', 'Industry Contacts'],
      lists: ['Webinar Interest List'],
      totalContacts: 8700
    },
    budget: 65000,
    spent: 48200,
    stages: [
      { id: 'STG-1', name: 'Registration', order: 1, status: 'completed', completionDate: '2025-08-15' },
      { id: 'STG-2', name: 'Reminder Campaign', order: 2, status: 'completed', completionDate: '2025-09-01' },
      { id: 'STG-3', name: 'Post-Webinar Follow-up', order: 3, status: 'in-progress' },
      { id: 'STG-4', name: 'Nurture Sequence', order: 4, status: 'pending' }
    ],
    metrics: {
      reach: 8700,
      delivered: 8526,
      opened: 5116,
      clicked: 2558,
      conversions: 234,
      revenue: 936000,
      engagement: 60.0
    },
    goals: [
      { type: 'Registrations', target: 1000, current: 892 },
      { type: 'Attendees', target: 600, current: 534 },
      { type: 'Follow-up Meetings', target: 100, current: 78 }
    ],
    owner: 'David Martinez',
    createdAt: '2025-07-15',
    tags: ['webinar', 'education', 'thought-leadership']
  },
  {
    id: 'CAM-005',
    name: 'Customer Reactivation - Win Back',
    type: 'email',
    status: 'running',
    description: 'Targeted campaign to re-engage dormant customers',
    startDate: '2025-10-10',
    endDate: '2025-11-30',
    targetAudience: {
      segments: ['Inactive Customers (90+ days)'],
      lists: ['Dormant Customer List'],
      totalContacts: 4200
    },
    budget: 35000,
    spent: 18500,
    stages: [
      { id: 'STG-1', name: 'We Miss You', order: 1, status: 'completed', completionDate: '2025-10-10' },
      { id: 'STG-2', name: 'Special Offer', order: 2, status: 'in-progress' },
      { id: 'STG-3', name: 'Last Chance', order: 3, status: 'pending' }
    ],
    metrics: {
      reach: 4200,
      delivered: 4074,
      opened: 1630,
      clicked: 489,
      conversions: 73,
      revenue: 292000,
      engagement: 40.0
    },
    goals: [
      { type: 'Reactivated Customers', target: 150, current: 73 },
      { type: 'Revenue', target: 500000, current: 292000 },
      { type: 'Response Rate', target: 15, current: 12 }
    ],
    owner: 'Sarah Johnson',
    createdAt: '2025-10-01',
    tags: ['reactivation', 'win-back', 'retention']
  },
  {
    id: 'CAM-006',
    name: 'Trade Show Follow-up Campaign',
    type: 'event-based',
    status: 'completed',
    description: 'Follow-up nurture for trade show leads',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    targetAudience: {
      segments: ['Trade Show Attendees - Q3'],
      lists: ['Booth Scan List'],
      totalContacts: 1850
    },
    budget: 28000,
    spent: 26500,
    stages: [
      { id: 'STG-1', name: 'Thank You', order: 1, status: 'completed', completionDate: '2025-07-05' },
      { id: 'STG-2', name: 'Product Info', order: 2, status: 'completed', completionDate: '2025-07-15' },
      { id: 'STG-3', name: 'Demo Offer', order: 3, status: 'completed', completionDate: '2025-08-01' },
      { id: 'STG-4', name: 'Final Follow-up', order: 4, status: 'completed', completionDate: '2025-09-15' }
    ],
    metrics: {
      reach: 1850,
      delivered: 1813,
      opened: 1088,
      clicked: 435,
      conversions: 89,
      revenue: 445000,
      engagement: 60.0
    },
    goals: [
      { type: 'Demo Bookings', target: 75, current: 89 },
      { type: 'Qualified Leads', target: 150, current: 167 },
      { type: 'Pipeline Generated', target: 500000, current: 445000 }
    ],
    owner: 'Michael Chen',
    createdAt: '2025-06-20',
    tags: ['trade-show', 'follow-up', 'events']
  },
  {
    id: 'CAM-007',
    name: 'Customer Success Stories - Content Series',
    type: 'multi-channel',
    status: 'running',
    description: 'Monthly customer success story campaign with social amplification',
    startDate: '2025-08-01',
    endDate: '2025-12-31',
    targetAudience: {
      segments: ['All Prospects', 'Evaluation Stage'],
      lists: ['Master Prospect List'],
      totalContacts: 18900
    },
    budget: 52000,
    spent: 36400,
    stages: [
      { id: 'STG-1', name: 'Email Campaign', order: 1, status: 'completed', completionDate: '2025-08-15' },
      { id: 'STG-2', name: 'Social Media', order: 2, status: 'in-progress' },
      { id: 'STG-3', name: 'Blog Promotion', order: 3, status: 'in-progress' },
      { id: 'STG-4', name: 'Follow-up Nurture', order: 4, status: 'pending' }
    ],
    metrics: {
      reach: 18900,
      delivered: 18144,
      opened: 9072,
      clicked: 3175,
      conversions: 245,
      revenue: 980000,
      engagement: 50.0
    },
    goals: [
      { type: 'Engagement Rate', target: 45, current: 50 },
      { type: 'Content Downloads', target: 500, current: 423 },
      { type: 'Sales Qualified Leads', target: 200, current: 245 }
    ],
    owner: 'Emily Rodriguez',
    createdAt: '2025-07-20',
    tags: ['content', 'case-study', 'social-proof']
  },
  {
    id: 'CAM-008',
    name: 'Partner Co-Marketing Initiative',
    type: 'multi-channel',
    status: 'paused',
    description: 'Joint marketing campaign with strategic partners',
    startDate: '2025-09-01',
    endDate: '2025-11-30',
    targetAudience: {
      segments: ['Partner Database', 'Joint Opportunities'],
      lists: ['Partner Contact List'],
      totalContacts: 6500
    },
    budget: 95000,
    spent: 45000,
    stages: [
      { id: 'STG-1', name: 'Planning & Alignment', order: 1, status: 'completed', completionDate: '2025-09-15' },
      { id: 'STG-2', name: 'Launch Phase', order: 2, status: 'in-progress' },
      { id: 'STG-3', name: 'Joint Webinar', order: 3, status: 'pending' },
      { id: 'STG-4', name: 'Follow-up Campaign', order: 4, status: 'pending' }
    ],
    metrics: {
      reach: 6500,
      delivered: 6175,
      opened: 2470,
      clicked: 741,
      conversions: 52,
      revenue: 312000,
      engagement: 40.0
    },
    goals: [
      { type: 'Joint Pipeline', target: 1000000, current: 450000 },
      { type: 'Partner Referrals', target: 100, current: 52 },
      { type: 'Co-branded Leads', target: 200, current: 89 }
    ],
    owner: 'David Martinez',
    createdAt: '2025-08-15',
    tags: ['partner', 'co-marketing', 'strategic']
  }
];

export default function MarketingCampaignsPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.marketingCampaigns.getAll();
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setCampaigns(
          rows.map((c: any) => ({
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
          })),
        );
      } catch {
        if (active) setCampaigns(mockCampaigns);
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
    avgEngagement: campaigns.reduce((sum, c) => sum + c.metrics.engagement, 0) / campaigns.length
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

  const handleCreateCampaign = () => {
    addToast({
      title: 'Campaign Created',
      message: 'New marketing campaign created successfully',
      variant: 'success'
    });
  };

  const handleCloneCampaign = (campaign: Campaign) => {
    addToast({
      title: 'Campaign Cloned',
      message: `"${campaign.name}" has been cloned successfully`,
      variant: 'success'
    });
  };

  const handlePauseCampaign = (campaign: Campaign) => {
    addToast({
      title: 'Campaign Paused',
      message: `"${campaign.name}" has been paused`,
      variant: 'warning'
    });
  };

  const handleResumeCampaign = (campaign: Campaign) => {
    addToast({
      title: 'Campaign Resumed',
      message: `"${campaign.name}" is now running`,
      variant: 'success'
    });
  };

  const handleStopCampaign = (campaign: Campaign) => {
    addToast({
      title: 'Campaign Stopped',
      message: `"${campaign.name}" has been stopped`,
      variant: 'info'
    });
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    addToast({
      title: 'Campaign Deleted',
      message: `"${campaign.name}" has been deleted`,
      variant: 'success'
    });
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
