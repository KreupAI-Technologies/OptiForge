'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Plus, Send, Eye, Users, TrendingUp, Target, Calendar, Search, Filter, Edit, Copy, Trash2, Play, Pause } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
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

const mockEmailCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Q4 Product Launch Announcement',
    subject: 'Introducing Our Revolutionary New Features',
    status: 'sent',
    audience: 12500,
    sent: 9800,
    delivered: 9650,
    opened: 4825,
    clicked: 1930,
    bounced: 150,
    unsubscribed: 28,
    sentDate: '2024-10-15T09:00:00',
    template: 'Product Launch Template',
    from: 'marketing@company.com',
  },
  {
    id: '2',
    name: 'Customer Success Stories Newsletter',
    subject: 'How Our Customers Are Achieving 10X ROI',
    status: 'sent',
    audience: 18900,
    sent: 15600,
    delivered: 15450,
    opened: 8505,
    clicked: 3401,
    bounced: 150,
    unsubscribed: 45,
    sentDate: '2024-10-10T10:00:00',
    template: 'Newsletter Template',
    from: 'success@company.com',
  },
  {
    id: '3',
    name: 'Holiday Promotion - Early Access',
    subject: '🎄 Exclusive Holiday Offer - 30% Off for You',
    status: 'scheduled',
    audience: 25600,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    scheduledDate: '2024-11-15T08:00:00',
    template: 'Promotional Template',
    from: 'sales@company.com',
  },
  {
    id: '4',
    name: 'Webinar Invitation - AI Innovation',
    subject: 'Join Us: The Future of AI in Enterprise',
    status: 'sent',
    audience: 8700,
    sent: 7800,
    delivered: 7720,
    opened: 4632,
    clicked: 1853,
    bounced: 80,
    unsubscribed: 12,
    sentDate: '2024-10-05T14:00:00',
    template: 'Event Invitation Template',
    from: 'events@company.com',
  },
  {
    id: '5',
    name: 'Re-engagement Campaign - Dormant Users',
    subject: 'We Miss You! Here\'s What You\'ve Been Missing',
    status: 'paused',
    audience: 5600,
    sent: 2800,
    delivered: 2758,
    opened: 828,
    clicked: 248,
    bounced: 42,
    unsubscribed: 35,
    sentDate: '2024-10-12T11:00:00',
    template: 'Re-engagement Template',
    from: 'support@company.com',
  },
  {
    id: '6',
    name: 'Weekly Product Updates',
    subject: 'This Week\'s New Features & Improvements',
    status: 'draft',
    audience: 22000,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    template: 'Update Newsletter Template',
    from: 'product@company.com',
  },
];

export default function EmailCampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.emailCampaigns.getAll();
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setCampaigns(
          rows.map((c: any) => ({
            id: String(c?.id ?? ''),
            name: c?.name ?? '',
            subject: c?.subject ?? '',
            status: (c?.status ?? 'draft') as EmailCampaign['status'],
            audience: Number(c?.audience ?? 0),
            sent: Number(c?.sent ?? 0),
            delivered: Number(c?.delivered ?? 0),
            opened: Number(c?.opened ?? 0),
            clicked: Number(c?.clicked ?? 0),
            bounced: Number(c?.bounced ?? 0),
            unsubscribed: Number(c?.unsubscribed ?? 0),
            scheduledDate: c?.scheduledDate ?? undefined,
            sentDate: c?.sentDate ?? undefined,
            template: c?.template ?? '',
            from: c?.from ?? '',
          })),
        );
      } catch {
        if (active) setCampaigns(mockEmailCampaigns);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<EmailCampaign | null>(null);

  const handleViewCampaign = (campaign: EmailCampaign) => {
    router.push(`/crm/campaigns/email/view/${campaign.id}`);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    router.push(`/crm/campaigns/email/edit/${campaign.id}`);
  };

  const handleCopyCampaign = (campaign: EmailCampaign) => {
    const newCampaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      status: 'draft' as const,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      sentDate: undefined,
      scheduledDate: undefined,
    };
    setCampaigns([...campaigns, newCampaign]);
  };

  const handlePlayCampaign = (campaign: EmailCampaign) => {
    setCampaigns(campaigns.map(c =>
      c.id === campaign.id ? { ...c, status: 'sending' } : c
    ));
  };

  const handleDeleteClick = (campaign: EmailCampaign) => {
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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCampaigns: campaigns.length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    avgOpenRate: campaigns.filter(c => c.sent > 0).length > 0
      ? campaigns.filter(c => c.sent > 0).reduce((sum, c) => sum + ((c.opened / c.sent) * 100), 0) / campaigns.filter(c => c.sent > 0).length
      : 0,
    avgClickRate: campaigns.filter(c => c.sent > 0).length > 0
      ? campaigns.filter(c => c.sent > 0).reduce((sum, c) => sum + ((c.clicked / c.sent) * 100), 0) / campaigns.filter(c => c.sent > 0).length
      : 0,
    totalUnsubscribed: campaigns.reduce((sum, c) => sum + c.unsubscribed, 0),
  };

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

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="mb-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <Mail className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalCampaigns}</div>
            <div className="text-blue-100">Total Campaigns</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <Send className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{(stats.totalSent / 1000).toFixed(1)}K</div>
            <div className="text-green-100">Emails Sent</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <Eye className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgOpenRate.toFixed(1)}%</div>
            <div className="text-purple-100">Avg Open Rate</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <Target className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgClickRate.toFixed(1)}%</div>
            <div className="text-orange-100">Avg Click Rate</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <Users className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalUnsubscribed}</div>
            <div className="text-red-100">Unsubscribed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-2">
        {filteredCampaigns.map((campaign) => {
          const openRate = campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0;
          const clickRate = campaign.sent > 0 ? (campaign.clicked / campaign.sent) * 100 : 0;
          const bounceRate = campaign.sent > 0 ? (campaign.bounced / campaign.sent) * 100 : 0;

          return (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">Subject: <span className="font-medium">{campaign.subject}</span></p>

                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 mb-1">Audience</div>
                      <div className="text-lg font-bold text-blue-900">{campaign.audience.toLocaleString()}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 mb-1">Sent</div>
                      <div className="text-lg font-bold text-green-900">{campaign.sent.toLocaleString()}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-purple-600 mb-1">Open Rate</div>
                      <div className="text-lg font-bold text-purple-900">{openRate.toFixed(1)}%</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-xs text-orange-600 mb-1">Click Rate</div>
                      <div className="text-lg font-bold text-orange-900">{clickRate.toFixed(1)}%</div>
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

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Template: <span className="font-medium">{campaign.template}</span></span>
                    <span>From: <span className="font-medium">{campaign.from}</span></span>
                    {campaign.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Scheduled: {new Date(campaign.scheduledDate).toLocaleString()}
                      </span>
                    )}
                    {campaign.sentDate && (
                      <span>Sent: {new Date(campaign.sentDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewCampaign(campaign)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleCopyCampaign(campaign)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  {campaign.status === 'paused' && (
                    <button
                      onClick={() => handlePlayCampaign(campaign)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Play</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(campaign)}
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setCampaignToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Email Campaign"
        message={campaignToDelete ? `Are you sure you want to delete "${campaignToDelete.name}"? This action cannot be undone and will remove all campaign data and analytics.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
