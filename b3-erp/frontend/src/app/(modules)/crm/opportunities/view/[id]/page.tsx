'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  PhoneCall,
  Video,
  Activity,
  ArrowRight,
  Circle,
  Package,
  Users,
  AlertCircle,
  Send,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface Opportunity {
  id: string;
  name: string;
  account: string;
  contact: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  amount: number;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdAt: string;
  type: string;
  leadSource: string;
  description: string;
}

interface OpportunityActivity {
  id: string;
  opportunityId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task' | 'proposal' | 'video_call';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: {
    previousStage?: string;
    newStage?: string;
    duration?: string;
    outcome?: string;
    attachments?: number;
  };
}

interface OpportunityStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  icon: any;
  color: string;
}

interface Product {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Mock opportunity data
const mockOpportunitySeed: Opportunity = {
  id: '1',
  name: 'Premium Kitchen Installation - Luxury Apartments',
  account: 'Skyline Properties Inc',
  contact: 'Robert Anderson',
  stage: 'proposal',
  amount: 350000,
  probability: 70,
  expectedCloseDate: '2025-11-15',
  owner: 'Sarah Johnson',
  createdAt: '2025-09-15',
  type: 'New Business',
  leadSource: 'Referral',
  description: 'Major opportunity for luxury apartment complex kitchen installations. Client is developer with multiple ongoing projects.',
};

// Mock activities
const mockActivitiesSeed: OpportunityActivity[] = [
  {
    id: 'a1',
    opportunityId: '1',
    type: 'stage_change',
    title: 'Stage Updated',
    description: 'Opportunity stage changed from "Qualification" to "Proposal"',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-10 14:30',
    metadata: { previousStage: 'qualification', newStage: 'proposal' }
  },
  {
    id: 'a2',
    opportunityId: '1',
    type: 'proposal',
    title: 'Proposal Sent',
    description: 'Comprehensive proposal sent including detailed pricing for all 15 units with premium finishes and installation timeline.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-10 10:00',
    metadata: { attachments: 3 }
  },
  {
    id: 'a3',
    opportunityId: '1',
    type: 'meeting',
    title: 'Site Visit Completed',
    description: 'Conducted detailed site visit with client team. Measured all 15 apartment units and discussed customization requirements.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-05 14:00',
    metadata: { duration: '4 hours', outcome: 'Positive' }
  },
  {
    id: 'a4',
    opportunityId: '1',
    type: 'call',
    title: 'Discovery Call',
    description: 'Detailed discussion about project requirements, timeline, and budget. Client confirmed $350K budget and Nov 15 decision deadline.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-09-25 11:30',
    metadata: { duration: '60 mins', outcome: 'Positive' }
  },
  {
    id: 'a5',
    opportunityId: '1',
    type: 'email',
    title: 'Product Catalog Shared',
    description: 'Sent comprehensive product catalog featuring modular kitchen solutions and premium countertop options.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-09-20 16:00',
    metadata: { attachments: 5 }
  },
  {
    id: 'a6',
    opportunityId: '1',
    type: 'stage_change',
    title: 'Opportunity Created',
    description: 'New opportunity created from referral lead',
    performedBy: 'System',
    timestamp: '2025-09-15 09:00',
    metadata: { newStage: 'prospecting' }
  }
];

// Mock products
const mockProductsSeed: Product[] = [
  { name: 'Premium Modular Kitchen Units', quantity: 15, unitPrice: 12000, total: 180000 },
  { name: 'Granite Countertops', quantity: 15, unitPrice: 8000, total: 120000 },
  { name: 'Installation & Setup', quantity: 1, unitPrice: 30000, total: 30000 },
  { name: 'Premium Hardware & Accessories', quantity: 15, unitPrice: 1333, total: 20000 },
];

const getOpportunityStages = (opportunity: Opportunity): OpportunityStage[] => {
  const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const currentIndex = stageOrder.indexOf(opportunity.stage);

  const stages: OpportunityStage[] = [
    { id: 'prospecting', name: 'Prospecting', status: currentIndex > 0 ? 'completed' : currentIndex === 0 ? 'current' : 'pending', date: currentIndex >= 0 ? opportunity.createdAt : undefined, icon: Circle, color: 'blue' },
    { id: 'qualification', name: 'Qualification', status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'pending', date: currentIndex >= 1 ? '2025-09-25' : undefined, icon: CheckCircle, color: 'purple' },
    { id: 'proposal', name: 'Proposal', status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'current' : 'pending', date: currentIndex >= 2 ? '2025-10-10' : undefined, icon: FileText, color: 'yellow' },
    { id: 'negotiation', name: 'Negotiation', status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'current' : 'pending', date: currentIndex >= 3 ? undefined : undefined, icon: MessageSquare, color: 'orange' },
    { id: 'closed_won', name: 'Closed Won', status: currentIndex === 4 ? 'current' : currentIndex > 4 ? 'completed' : 'pending', icon: TrendingUp, color: 'emerald' },
    { id: 'closed_lost', name: 'Closed Lost', status: currentIndex === 5 ? 'current' : 'pending', icon: AlertCircle, color: 'red' }
  ];

  // Remove closed_lost from normal flow if opportunity is not lost
  return opportunity.stage === 'closed_lost' ? stages : stages.filter(s => s.id !== 'closed_lost');
};

const activityIcons = {
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  stage_change: Activity,
  task: CheckCircle,
  proposal: FileText,
  video_call: Video
};

const activityColors = {
  call: 'bg-blue-100 text-blue-600 border-blue-200',
  email: 'bg-purple-100 text-purple-600 border-purple-200',
  meeting: 'bg-green-100 text-green-600 border-green-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  stage_change: 'bg-orange-100 text-orange-600 border-orange-200',
  task: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  proposal: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  video_call: 'bg-pink-100 text-pink-600 border-pink-200'
};

const stageColors = {
  prospecting: 'bg-blue-100 text-blue-700',
  qualification: 'bg-purple-100 text-purple-700',
  proposal: 'bg-yellow-100 text-yellow-700',
  negotiation: 'bg-orange-100 text-orange-700',
  closed_won: 'bg-emerald-100 text-emerald-700',
  closed_lost: 'bg-red-100 text-red-700',
};

const stageLabels = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export default function ViewOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.id as string;
  const { addToast } = useToast();

  const [opportunity, setOpportunity] = useState<Opportunity>(mockOpportunitySeed);
  const [activities, setActivities] = useState<OpportunityActivity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!opportunityId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // (a) primary entity
        const raw: any = await crmService.opportunities.getById(opportunityId);
        if (!cancelled && raw && typeof raw === 'object') {
          setOpportunity({
            ...mockOpportunitySeed,
            id: raw.id ?? opportunityId,
            name: raw.name ?? mockOpportunitySeed.name,
            account: raw.customerName ?? raw.account ?? mockOpportunitySeed.account,
            contact: raw.contactName ?? mockOpportunitySeed.contact,
            stage: (raw.stage ?? mockOpportunitySeed.stage) as Opportunity['stage'],
            amount: Number(raw.amount ?? mockOpportunitySeed.amount),
            probability: Number(raw.probability ?? mockOpportunitySeed.probability),
            expectedCloseDate: (raw.expectedCloseDate ?? mockOpportunitySeed.expectedCloseDate)?.toString().slice(0, 10),
            owner: raw.ownerName ?? mockOpportunitySeed.owner,
            createdAt: (raw.createdAt ?? mockOpportunitySeed.createdAt)?.toString().slice(0, 10),
            type: raw.type ?? mockOpportunitySeed.type,
            leadSource: raw.leadSource ?? mockOpportunitySeed.leadSource,
            description: raw.description ?? mockOpportunitySeed.description,
          });
          // Products are carried on the opportunity record itself.
          if (Array.isArray(raw.products)) {
            setProducts(
              raw.products.map((p: any) => ({
                name: p.name ?? p.productName ?? 'Item',
                quantity: Number(p.quantity ?? 1),
                unitPrice: Number(p.unitPrice ?? p.price ?? 0),
                total: Number(p.total ?? (p.quantity ?? 1) * (p.unitPrice ?? p.price ?? 0)),
              })),
            );
          }
        }

        // (b) related activity timeline
        const activitiesRaw = await crmService.opportunities
          .getActivities(opportunityId)
          .catch(() => []);
        if (!cancelled) {
          setActivities(
            (activitiesRaw as any[]).map((a, i) => ({
              id: a.id ?? String(i),
              opportunityId,
              type:
                ['call', 'email', 'meeting', 'note', 'task'].includes(a.type)
                  ? a.type
                  : 'note',
              title: a.subject ?? a.title ?? 'Activity',
              description: a.description ?? a.notes ?? '',
              performedBy: a.performedByName ?? a.assignedToName ?? 'System',
              timestamp: (a.startDate ?? a.createdAt ?? '').toString().slice(0, 16).replace('T', ' '),
              metadata: a.outcome ? { outcome: a.outcome } : undefined,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load opportunity');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'products'>('overview');

  // Handler functions for opportunity actions
  const handleUpdateStage = () => {
    addToast({
      title: 'Update Stage',
      message: 'Opening stage update dialog...',
      variant: 'info'
    });
    // Future: Show modal to update opportunity stage with dropdown
  };

  const handleSendProposal = () => {
    addToast({
      title: 'Send Proposal',
      message: `Preparing proposal for ${opportunity.name}...`,
      variant: 'info'
    });
    // Future: router.push(`/crm/opportunities/${opportunityId}/send-proposal`);
  };

  const handleLogCall = () => {
    addToast({
      title: 'Log Call',
      message: 'Opening call log form...',
      variant: 'info'
    });
    // Future: router.push(`/crm/opportunities/${opportunityId}/log-call`);
  };

  const handleSendEmail = () => {
    addToast({
      title: 'Send Email',
      message: `Opening email compose for ${opportunity.account}...`,
      variant: 'info'
    });
    // Future: router.push(`/crm/opportunities/${opportunityId}/send-email`);
  };

  const handleScheduleMeeting = () => {
    addToast({
      title: 'Schedule Meeting',
      message: 'Opening meeting scheduler...',
      variant: 'info'
    });
    // Future: router.push(`/crm/opportunities/${opportunityId}/schedule-meeting`);
  };

  const handleAddNote = () => {
    addToast({
      title: 'Add Note',
      message: 'Opening note creation form...',
      variant: 'info'
    });
    // Future: router.push(`/crm/opportunities/${opportunityId}/add-note`);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Target },
    { id: 'activity', name: 'Activity Timeline', icon: Activity },
    { id: 'products', name: 'Products & Details', icon: Package },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{loadError}</span>
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading opportunity…
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/crm/opportunities')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Opportunities</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Opportunity Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4 flex-1">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{opportunity.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-600">{opportunity.account}</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${stageColors[opportunity.stage]}`}>
                    {stageLabels[opportunity.stage]}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-3xl font-bold text-blue-900">${opportunity.amount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">• Owner: {opportunity.owner}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/crm/opportunities/edit/${opportunityId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleUpdateStage}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Update Stage</span>
              </button>
              <button
                onClick={handleSendProposal}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Proposal</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Amount</p>
              <p className="text-2xl font-bold text-blue-900">${opportunity.amount.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Probability</p>
              <p className="text-2xl font-bold text-purple-900">{opportunity.probability}%</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Expected Close</p>
              <p className="text-lg font-semibold text-green-900">{opportunity.expectedCloseDate}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Stage</p>
              <p className="text-lg font-semibold text-orange-900">{stageLabels[opportunity.stage]}</p>
            </div>
          </div>

          {/* Sales Stage Progress Tracker */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Sales Stage Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {getOpportunityStages(opportunity).map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isLast = index === getOpportunityStages(opportunity).length - 1;

                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center relative z-10">
                        {/* Stage Icon */}
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          stage.status === 'completed'
                            ? 'bg-green-500 border-green-600'
                            : stage.status === 'current'
                            ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200'
                            : 'bg-gray-200 border-gray-300'
                        }`}>
                          <StageIcon className={`h-6 w-6 ${
                            stage.status === 'completed' || stage.status === 'current'
                              ? 'text-white'
                              : 'text-gray-400'
                          }`} />
                        </div>

                        {/* Stage Name */}
                        <div className="mt-2 text-center">
                          <p className={`text-xs font-semibold ${
                            stage.status === 'current' ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {stage.name}
                          </p>
                          {stage.date && (
                            <p className="text-xs text-gray-500 mt-0.5">{stage.date}</p>
                          )}
                        </div>
                      </div>

                      {/* Connector Line */}
                      {!isLast && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Opportunity Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Opportunity Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Opportunity Name</p>
                  <p className="text-sm font-semibold text-gray-900">{opportunity.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Type</p>
                  <p className="text-sm text-gray-900">{opportunity.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lead Source</p>
                  <p className="text-sm text-gray-900">{opportunity.leadSource}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-900">{opportunity.description}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Account Name</p>
                  <p className="text-sm font-semibold text-gray-900">{opportunity.account}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Primary Contact</p>
                  <p className="text-sm text-gray-900">{opportunity.contact}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Industry</p>
                  <p className="text-sm text-gray-900">Real Estate Development</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Key Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600 uppercase">Deal Value</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">${opportunity.amount.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <p className="text-xs font-medium text-purple-600 uppercase">Win Probability</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{opportunity.probability}%</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <p className="text-xs font-medium text-green-600 uppercase">Expected Close</p>
                  </div>
                  <p className="text-lg font-bold text-green-900">{opportunity.expectedCloseDate}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <p className="text-xs font-medium text-orange-600 uppercase">Age (Days)</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {Math.floor((new Date().getTime() - new Date(opportunity.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Timeline Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleLogCall}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Log Call</span>
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-2">
              {activities
                .filter(activity => activity.opportunityId === opportunityId)
                .map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type];
                  const isLast = index === activities.filter(a => a.opportunityId === opportunityId).length - 1;

                  return (
                    <div key={activity.id} className="relative">
                      {/* Timeline connector */}
                      {!isLast && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                      )}

                      <div className="flex items-start space-x-4">
                        {/* Activity Icon */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${activityColors[activity.type]}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        {/* Activity Content */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-base font-bold text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                by {activity.performedBy} • {activity.timestamp}
                              </p>
                            </div>
                            {activity.metadata?.outcome && (
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                activity.metadata.outcome === 'Positive'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {activity.metadata.outcome}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-700 mb-3">{activity.description}</p>

                          {/* Activity Metadata */}
                          {activity.metadata && (
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {activity.metadata.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{activity.metadata.duration}</span>
                                </div>
                              )}
                              {activity.metadata.attachments && (
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{activity.metadata.attachments} attachments</span>
                                </div>
                              )}
                              {activity.metadata.previousStage && activity.metadata.newStage && (
                                <div className="flex items-center space-x-1">
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="capitalize">{activity.metadata.previousStage}</span>
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="capitalize font-semibold">{activity.metadata.newStage}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Products & Details Tab */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            {/* Products List */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Products & Services
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product/Service</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">{product.quantity}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">${product.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">${product.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50">
                      <td colSpan={3} className="px-3 py-2 text-sm font-bold text-gray-900 text-right">Grand Total</td>
                      <td className="px-3 py-2 text-lg font-bold text-blue-900 text-right">
                        ${products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competition Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Competition
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">Elite Kitchen Systems, Luxury Home Solutions</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Decision Criteria
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">Quality of materials, previous portfolio, installation timeline, warranty terms, competitive pricing</p>
                </div>
              </div>
            </div>

            {/* Requirements & Pain Points */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Customer Requirements
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Requirements</p>
                  <p className="text-sm text-gray-700">High-end modular kitchen solutions for 15 luxury apartments. Requirements include premium finishes, granite countertops, modern appliances integration, and 2-year warranty.</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Pain Points</p>
                  <p className="text-sm text-gray-700">Current contractor unable to meet quality standards and timeline. Need reliable partner for ongoing projects.</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Timeline</p>
                  <p className="text-sm text-gray-700">Decision by Oct 30, Installation to start Nov 20, Project completion by Jan 15 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
