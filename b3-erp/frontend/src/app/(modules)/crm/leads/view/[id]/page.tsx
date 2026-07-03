'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Phone, Building2, User, Calendar, TrendingUp, Globe, Clock, CheckCircle, MessageSquare, FileText, PhoneCall, Video, Activity, ArrowRight, Circle, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  source: string;
  value: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
}

interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'task' | 'proposal' | 'video_call';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: {
    previousStatus?: string;
    newStatus?: string;
    duration?: string;
    outcome?: string;
    attachments?: number;
  };
}

interface LeadStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  icon: any;
  color: string;
}

// Mock lead data
const mockLead: Lead = {
  id: '1',
  name: 'John Smith',
  company: 'Tech Solutions Inc',
  email: 'john.smith@techsolutions.com',
  phone: '+1 234-567-8900',
  status: 'qualified',
  source: 'Website',
  value: 45000,
  assignedTo: 'Sarah Johnson',
  createdAt: '2025-10-01',
  lastContact: '2025-10-08',
};

// Mock activities
const mockActivities: LeadActivity[] = [
  {
    id: 'a1',
    leadId: '1',
    type: 'status_change',
    title: 'Status Changed',
    description: 'Lead status updated from "Contacted" to "Qualified"',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-08 14:30',
    metadata: { previousStatus: 'contacted', newStatus: 'qualified' }
  },
  {
    id: 'a2',
    leadId: '1',
    type: 'call',
    title: 'Phone Call',
    description: 'Discussed product requirements and pricing options. Client is interested in modular kitchen solutions.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-08 10:15',
    metadata: { duration: '45 mins', outcome: 'Positive' }
  },
  {
    id: 'a3',
    leadId: '1',
    type: 'email',
    title: 'Email Sent',
    description: 'Sent product catalog and pricing information',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-07 16:20',
    metadata: { attachments: 3 }
  },
  {
    id: 'a4',
    leadId: '1',
    type: 'meeting',
    title: 'Site Visit Scheduled',
    description: 'Arranged site visit for kitchen measurement and design consultation on Oct 15, 2025',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-06 11:00',
    metadata: { duration: '2 hours' }
  },
  {
    id: 'a5',
    leadId: '1',
    type: 'note',
    title: 'Added Note',
    description: 'Client has a budget of $45K-50K. Looking for premium finish with granite countertops.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-05 09:30'
  },
  {
    id: 'a6',
    leadId: '1',
    type: 'call',
    title: 'Initial Contact',
    description: 'First contact call. Introduced our kitchen solutions and gathered basic requirements.',
    performedBy: 'Sarah Johnson',
    timestamp: '2025-10-02 14:45',
    metadata: { duration: '20 mins', outcome: 'Interested' }
  },
  {
    id: 'a7',
    leadId: '1',
    type: 'status_change',
    title: 'Lead Created',
    description: 'New lead created from website inquiry',
    performedBy: 'System',
    timestamp: '2025-10-01 09:00',
    metadata: { newStatus: 'new' }
  }
];

const getLeadStages = (lead: Lead): LeadStage[] => {
  const stages: LeadStage[] = [
    { id: 'new', name: 'New Lead', status: 'completed', date: lead.createdAt, icon: Circle, color: 'blue' },
    { id: 'contacted', name: 'Contacted', status: 'completed', date: '2025-10-02', icon: PhoneCall, color: 'purple' },
    { id: 'qualified', name: 'Qualified', status: 'current', date: '2025-10-08', icon: CheckCircle, color: 'green' },
    { id: 'proposal', name: 'Proposal Sent', status: 'pending', icon: FileText, color: 'yellow' },
    { id: 'negotiation', name: 'Negotiation', status: 'pending', icon: MessageSquare, color: 'orange' },
    { id: 'won', name: 'Won', status: 'pending', icon: TrendingUp, color: 'emerald' }
  ];

  return stages;
};

const activityIcons = {
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  status_change: Activity,
  task: CheckCircle,
  proposal: FileText,
  video_call: Video
};

const activityColors = {
  call: 'bg-blue-100 text-blue-600 border-blue-200',
  email: 'bg-purple-100 text-purple-600 border-purple-200',
  meeting: 'bg-green-100 text-green-600 border-green-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  status_change: 'bg-orange-100 text-orange-600 border-orange-200',
  task: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  proposal: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  video_call: 'bg-pink-100 text-pink-600 border-pink-200'
};

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-green-100 text-green-700',
  proposal: 'bg-yellow-100 text-yellow-700',
  negotiation: 'bg-orange-100 text-orange-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
};

const leadStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const;

export default function ViewLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;
  const { addToast } = useToast();

  const [lead, setLead] = useState<Lead>(mockLead);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'details'>('overview');

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.leads.getById(leadId);
        if (!cancelled && data) {
          const rawStatus = String(data.status ?? '').toLowerCase();
          const status = (leadStatuses as readonly string[]).includes(rawStatus)
            ? (rawStatus as Lead['status'])
            : 'new';
          const firstName = data.firstName ?? '';
          const lastName = data.lastName ?? '';
          const composedName = `${firstName} ${lastName}`.trim();
          setLead({
            id: String(data.id ?? leadId),
            name: data.name ?? composedName ?? '',
            company: data.company ?? data.companyName ?? data.customerName ?? '',
            email: data.email ?? '',
            phone: data.phone ?? data.mobile ?? '',
            status,
            source: data.source ?? data.leadSource ?? '',
            value: Number(data.value ?? data.estimatedValue ?? data.dealValue ?? 0) || 0,
            assignedTo: data.assignedTo ?? data.owner ?? data.assignedToName ?? '',
            createdAt: data.createdAt ?? data.createdDate ?? '',
            lastContact: data.lastContact ?? data.lastContactDate ?? data.updatedAt ?? '',
          });
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
  }, [leadId]);

  // Handler functions for lead actions
  const handleSendEmail = () => {
    addToast({
      title: 'Send Email',
      message: `Opening email compose for ${lead.name}...`,
      variant: 'info'
    });
    // Future: router.push(`/crm/leads/${leadId}/send-email`);
  };

  const handleMore = () => {
    addToast({
      title: 'More Actions',
      message: 'Opening additional lead actions menu...',
      variant: 'info'
    });
    // Future: Show dropdown menu with Convert to Opportunity, Delete, etc.
  };

  const handleLogCall = () => {
    addToast({
      title: 'Log Call',
      message: 'Opening call log form...',
      variant: 'info'
    });
    // Future: router.push(`/crm/leads/${leadId}/log-call`);
  };

  const handleScheduleMeeting = () => {
    addToast({
      title: 'Schedule Meeting',
      message: 'Opening meeting scheduler...',
      variant: 'info'
    });
    // Future: router.push(`/crm/leads/${leadId}/schedule-meeting`);
  };

  const handleAddNote = () => {
    addToast({
      title: 'Add Note',
      message: 'Opening note creation form...',
      variant: 'info'
    });
    // Future: router.push(`/crm/leads/${leadId}/add-note`);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'activity', name: 'Activity Timeline', icon: Activity },
    { id: 'details', name: 'Full Details', icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
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
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/crm/leads')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Leads</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Lead Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{lead.company}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[lead.status]}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">Assigned to: {lead.assignedTo}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/crm/leads/edit/${leadId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
              <button
                onClick={handleMore}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <MoreVertical className="h-5 w-5" />
                <span>More</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Deal Value</p>
              <p className="text-2xl font-bold text-blue-900">${lead.value.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Source</p>
              <p className="text-lg font-semibold text-purple-900">{lead.source}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Last Contact</p>
              <p className="text-lg font-semibold text-green-900">{lead.lastContact}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Activities</p>
              <p className="text-lg font-semibold text-orange-900">{mockActivities.filter(a => a.leadId === leadId).length} Total</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Lead Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {getLeadStages(lead).map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isLast = index === getLeadStages(lead).length - 1;

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
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline break-all">{lead.email}</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-blue-600 hover:underline">{lead.phone}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Company Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.company}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Industry</p>
                  <p className="text-sm text-gray-900">Manufacturing</p>
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Lead Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lead Source</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.source}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Assigned To</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.assignedTo}</p>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Key Dates
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Contact</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.lastContact}</p>
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
              {mockActivities
                .filter(activity => activity.leadId === leadId)
                .map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type];
                  const isLast = index === mockActivities.filter(a => a.leadId === leadId).length - 1;

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
                              {activity.metadata.previousStatus && activity.metadata.newStatus && (
                                <div className="flex items-center space-x-1">
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="capitalize">{activity.metadata.previousStatus}</span>
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="capitalize font-semibold">{activity.metadata.newStatus}</span>
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

        {/* Full Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            {/* All detailed sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Job Title</p>
                    <p className="text-sm text-gray-900">VP of Operations</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Opportunity Details</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Estimated Value</p>
                    <p className="text-lg font-bold text-blue-900">${lead.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Win Probability</p>
                    <p className="text-sm text-gray-900">60%</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Product Interest</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Modular Kitchen Solutions</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Kitchen Countertops</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Kitchen Cabinets & Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
