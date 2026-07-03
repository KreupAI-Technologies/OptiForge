'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Headphones,
  AlertCircle,
  ThumbsUp,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  Send,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'site_visit' | 'support' | 'complaint' | 'feedback';
  customer: string;
  contactPerson: string;
  subject: string;
  description: string;
  performedBy: string;
  dateTime: string;
  duration: string;
  outcome: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
  location?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  assignedTo?: string;
  tags: string[];
  participants: string[];
}

interface RelatedActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'site_visit' | 'support' | 'complaint' | 'feedback';
  subject: string;
  performedBy: string;
  dateTime: string;
  outcome: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
}

const mockInteraction: Interaction = {
  id: '1',
  type: 'call',
  customer: 'Modern Kitchen Designs Ltd',
  contactPerson: 'Sarah Johnson',
  subject: 'Discussed new modular kitchen requirements',
  description: 'Customer is interested in a complete modular kitchen setup for their new apartment. They are looking for premium materials with granite countertops. Budget discussed: $40K-50K. Next step: Send detailed proposal with 3D designs.',
  performedBy: 'Michael Chen',
  dateTime: '2025-10-11 10:30',
  duration: '45 mins',
  outcome: 'positive',
  followUpRequired: true,
  followUpDate: '2025-10-15',
  assignedTo: 'Michael Chen',
  tags: ['high-value', 'urgent', 'modular-kitchen'],
  participants: ['Michael Chen', 'Sarah Johnson'],
};

const relatedActivities: RelatedActivity[] = [
  {
    id: '2',
    type: 'email',
    subject: 'Sent initial product catalog and pricing',
    performedBy: 'Michael Chen',
    dateTime: '2025-10-05 14:20',
    outcome: 'neutral',
  },
  {
    id: '3',
    type: 'call',
    subject: 'Initial inquiry about modular kitchens',
    performedBy: 'Sarah Johnson',
    dateTime: '2025-10-03 11:00',
    outcome: 'positive',
  },
  {
    id: '4',
    type: 'site_visit',
    subject: 'Site measurement and consultation scheduled',
    performedBy: 'David Park',
    dateTime: '2025-09-28 09:30',
    outcome: 'positive',
  },
];

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: MessageSquare,
  site_visit: MapPin,
  support: Headphones,
  complaint: AlertCircle,
  feedback: ThumbsUp,
};

const typeColors = {
  call: 'bg-blue-100 text-blue-700 border-blue-200',
  email: 'bg-purple-100 text-purple-700 border-purple-200',
  meeting: 'bg-green-100 text-green-700 border-green-200',
  site_visit: 'bg-orange-100 text-orange-700 border-orange-200',
  support: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  complaint: 'bg-red-100 text-red-700 border-red-200',
  feedback: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const outcomeColors = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
  follow_up_required: 'bg-yellow-100 text-yellow-700',
};

const interactionTypes = ['call', 'email', 'meeting', 'site_visit', 'support', 'complaint', 'feedback'] as const;
const interactionOutcomes = ['positive', 'neutral', 'negative', 'follow_up_required'] as const;

export default function ViewInteractionPage() {
  const router = useRouter();
  const params = useParams();
  const interactionId = params?.id as string;
  const { addToast } = useToast();

  const [interaction, setInteraction] = useState<Interaction>(mockInteraction);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'activities'>('details');

  useEffect(() => {
    if (!interactionId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        let data: any;
        try {
          data = await crmService.interactions.getById(interactionId);
        } catch (primaryErr) {
          data = await crmService.interactions.getByIdLegacy(interactionId);
        }
        if (!cancelled && data) {
          const rawType = String(data.type ?? '').toLowerCase();
          const type = (interactionTypes as readonly string[]).includes(rawType)
            ? (rawType as Interaction['type'])
            : 'call';
          const rawOutcome = String(data.outcome ?? '').toLowerCase();
          const outcome = (interactionOutcomes as readonly string[]).includes(rawOutcome)
            ? (rawOutcome as Interaction['outcome'])
            : 'neutral';
          setInteraction({
            id: String(data.id ?? interactionId),
            type,
            customer: data.customer ?? data.customerName ?? data.company ?? '',
            contactPerson: data.contactPerson ?? data.contactName ?? '',
            subject: data.subject ?? data.title ?? '',
            description: data.description ?? data.notes ?? '',
            performedBy: data.performedBy ?? data.createdBy ?? data.owner ?? '',
            dateTime: data.dateTime ?? data.date ?? data.interactionDate ?? data.createdAt ?? '',
            duration: data.duration ?? '',
            outcome,
            location: data.location ?? undefined,
            followUpRequired: Boolean(data.followUpRequired ?? data.followUp ?? false),
            followUpDate: data.followUpDate ?? undefined,
            assignedTo: data.assignedTo ?? undefined,
            tags: Array.isArray(data.tags) ? data.tags : [],
            participants: Array.isArray(data.participants) ? data.participants : [],
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
  }, [interactionId]);

  const TypeIcon = typeIcons[interaction.type];

  // Handler functions for interaction actions
  const handleScheduleFollowUp = () => {
    addToast({
      title: 'Schedule Follow-up',
      message: `Opening scheduler for follow-up with ${interaction.customer}...`,
      variant: 'info'
    });
    // Future: router.push(`/crm/interactions/${interactionId}/schedule-followup`);
  };

  const handleSendEmail = () => {
    addToast({
      title: 'Send Email',
      message: `Opening email compose for ${interaction.contactPerson} at ${interaction.customer}...`,
      variant: 'info'
    });
    // Future: router.push(`/crm/interactions/${interactionId}/send-email`);
  };

  const formatTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatOutcomeLabel = (outcome: string) => {
    return outcome.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const tabs = [
    { id: 'details', name: 'Details', icon: FileText },
    { id: 'activities', name: 'Related Activities', icon: MessageSquare },
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
          onClick={() => router.push('/crm/interactions')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Interactions</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Interaction Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 ${typeColors[interaction.type]}`}>
                <TypeIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{interaction.subject}</h1>
                <p className="text-lg text-gray-600 mt-1">{interaction.customer}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${outcomeColors[interaction.outcome]}`}>
                    {formatOutcomeLabel(interaction.outcome)}
                  </span>
                  <span className="text-sm text-gray-500">Performed by: {interaction.performedBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/crm/interactions/edit/${interactionId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              {interaction.followUpRequired && (
                <button
                  onClick={handleScheduleFollowUp}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Follow-up</span>
                </button>
              )}
              <button
                onClick={handleSendEmail}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Date & Time</p>
              <p className="text-lg font-bold text-blue-900">{interaction.dateTime}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Duration</p>
              <p className="text-lg font-semibold text-purple-900">{interaction.duration}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Outcome</p>
              <p className="text-lg font-semibold text-green-900">{formatOutcomeLabel(interaction.outcome)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Follow-up Required</p>
              <p className="text-lg font-semibold text-orange-900">{interaction.followUpRequired ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Call-to-Action */}
      {interaction.followUpRequired && (
        <div className="mb-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-1">Follow-up Required</h3>
              <p className="text-sm text-yellow-800">
                Scheduled for: <span className="font-semibold">{interaction.followUpDate}</span> | Assigned to: <span className="font-semibold">{interaction.assignedTo}</span>
              </p>
            </div>
            <button
              onClick={handleScheduleFollowUp}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              <Calendar className="h-5 w-5" />
              <span>Schedule Follow-up Now</span>
            </button>
          </div>
        </div>
      )}

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
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            {/* Interaction Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Interaction Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Type</p>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border ${typeColors[interaction.type]}`}>
                    <TypeIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{formatTypeLabel(interaction.type)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Performed By</p>
                  <p className="text-sm font-semibold text-gray-900">{interaction.performedBy}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-gray-900">{interaction.dateTime}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">{interaction.duration}</p>
                </div>
                {interaction.location && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Location</p>
                    <p className="text-sm font-semibold text-gray-900">{interaction.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Customer Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{interaction.customer}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Person</p>
                  <p className="text-sm font-semibold text-gray-900">{interaction.contactPerson}</p>
                </div>
              </div>
            </div>

            {/* Notes/Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Notes / Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{interaction.description}</p>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Participants
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {interaction.participants.map(participant => (
                    <div key={participant} className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{participant}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            {interaction.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {interaction.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Related Activities Timeline</h3>
              <span className="text-sm text-gray-600">All interactions with {interaction.customer}</span>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              {relatedActivities.map((activity, index) => {
                const ActivityIcon = typeIcons[activity.type];
                const isLast = index === relatedActivities.length - 1;

                return (
                  <div key={activity.id} className="relative">
                    {!isLast && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                    )}

                    <div className="flex items-start space-x-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${typeColors[activity.type]}`}>
                        <ActivityIcon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-base font-bold text-gray-900">{activity.subject}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              by {activity.performedBy} " {activity.dateTime}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${outcomeColors[activity.outcome]}`}>
                            {formatOutcomeLabel(activity.outcome)}
                          </span>
                        </div>
                        <button
                          onClick={() => router.push(`/crm/interactions/view/${activity.id}`)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
