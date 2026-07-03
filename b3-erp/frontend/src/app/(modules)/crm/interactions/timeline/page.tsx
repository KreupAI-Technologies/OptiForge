'use client';

import { useState, useEffect } from 'react';
import { Clock, Phone, Mail, Users, MessageSquare, FileText, Calendar, DollarSign, CheckCircle, AlertCircle, User, Building2, Search, Filter, Download } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface TimelineEvent {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  relatedTo: string;
  relatedType: 'lead' | 'opportunity' | 'customer' | 'contact';
  outcome?: string;
  metadata?: {
    duration?: number;
    attendees?: string[];
    dealValue?: number;
    oldStatus?: string;
    newStatus?: string;
    attachments?: number;
  };
}

const EVENT_TYPES = ['call', 'email', 'meeting', 'note', 'task', 'deal', 'status_change'] as const;

function mapInteractionToEvent(raw: any): TimelineEvent {
  const rawType = String(raw?.type ?? '').toLowerCase();
  const type = (EVENT_TYPES as readonly string[]).includes(rawType)
    ? (rawType as TimelineEvent['type'])
    : 'note';
  const durationNum = Number(raw?.duration);
  return {
    id: String(raw?.id ?? ''),
    type,
    title: raw?.subject ?? raw?.title ?? 'Interaction',
    description: raw?.description ?? raw?.outcome ?? '',
    timestamp: String(raw?.dateTime ?? raw?.createdAt ?? new Date().toISOString()),
    user: raw?.performedBy ?? raw?.assignedTo ?? 'Unknown',
    relatedTo: raw?.customer ?? raw?.contactPerson ?? raw?.relatedOpportunity ?? '—',
    relatedType: raw?.relatedOpportunity ? 'opportunity' : 'customer',
    outcome: raw?.outcome ?? undefined,
    metadata: {
      duration: Number.isFinite(durationNum) && durationNum > 0 ? durationNum : undefined,
    },
  };
}

export default function InteractionsTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await crmService.interactions.getAllLegacy()) as any[];
        const mapped = (Array.isArray(raw) ? raw : []).map(mapInteractionToEvent);
        if (!cancelled) setEvents(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load interaction timeline');
          setEvents([]);
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
  const [filterType, setFilterType] = useState<'all' | 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal' | 'status_change'>('all');
  const [filterRelatedType, setFilterRelatedType] = useState<'all' | 'lead' | 'opportunity' | 'customer' | 'contact'>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  const users = ['all', ...Array.from(new Set(events.map(e => e.user)))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.relatedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesRelatedType = filterRelatedType === 'all' || event.relatedType === filterRelatedType;
    const matchesUser = filterUser === 'all' || event.user === filterUser;
    return matchesSearch && matchesType && matchesRelatedType && matchesUser;
  });

  const stats = {
    totalEvents: events.length,
    calls: events.filter(e => e.type === 'call').length,
    emails: events.filter(e => e.type === 'email').length,
    meetings: events.filter(e => e.type === 'meeting').length,
    notes: events.filter(e => e.type === 'note').length,
    tasks: events.filter(e => e.type === 'task').length,
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'meeting':
        return <Users className="w-5 h-5" />;
      case 'note':
        return <MessageSquare className="w-5 h-5" />;
      case 'task':
        return <CheckCircle className="w-5 h-5" />;
      case 'deal':
        return <DollarSign className="w-5 h-5" />;
      case 'status_change':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'email':
        return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'meeting':
        return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'note':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'task':
        return 'bg-teal-100 border-teal-300 text-teal-700';
      case 'deal':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'status_change':
        return 'bg-pink-100 border-pink-300 text-pink-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getRelatedTypeColor = (type: string) => {
    switch (type) {
      case 'lead':
        return 'bg-blue-100 text-blue-700';
      case 'opportunity':
        return 'bg-purple-100 text-purple-700';
      case 'customer':
        return 'bg-green-100 text-green-700';
      case 'contact':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading interaction timeline…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && events.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No interactions found.
        </div>
      )}
      <div className="mb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalEvents}</div>
            <div className="text-blue-100">Total Events</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Phone className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.calls}</div>
            <div className="text-green-100">Calls</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.emails}</div>
            <div className="text-orange-100">Emails</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.meetings}</div>
            <div className="text-purple-100">Meetings</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.notes}</div>
            <div className="text-teal-100">Notes</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.tasks}</div>
            <div className="text-pink-100">Tasks</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search interactions..."
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
                <option value="call">Calls</option>
                <option value="email">Emails</option>
                <option value="meeting">Meetings</option>
                <option value="note">Notes</option>
                <option value="task">Tasks</option>
                <option value="deal">Deals</option>
                <option value="status_change">Status Changes</option>
              </select>

              <select
                value={filterRelatedType}
                onChange={(e) => setFilterRelatedType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Related</option>
                <option value="lead">Leads</option>
                <option value="opportunity">Opportunities</option>
                <option value="customer">Customers</option>
                <option value="contact">Contacts</option>
              </select>

              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {users.map(user => (
                  <option key={user} value={user}>
                    {user === 'all' ? 'All Users' : user}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="text-sm font-semibold text-gray-600 px-4 py-2 bg-gray-100 rounded-full">
                {date}
              </div>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="space-y-2">
              {dateEvents.map((event, index) => (
                <div key={event.id} className="flex gap-2">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-full border-2 ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    {index < dateEvents.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow mb-2">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(event.type)}`}>
                            {event.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRelatedTypeColor(event.relatedType)}`}>
                            {event.relatedType}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{event.user}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{event.relatedTo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimestamp(event.timestamp)}</span>
                          </div>
                          {event.metadata?.duration && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{event.metadata.duration} minutes</span>
                            </div>
                          )}
                        </div>

                        {/* Additional Metadata */}
                        {event.metadata?.attendees && event.metadata.attendees.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600 font-medium">Attendees: </span>
                            <span className="text-xs text-gray-600">{event.metadata.attendees.join(', ')}</span>
                          </div>
                        )}

                        {event.metadata?.dealValue && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600 font-medium">Deal Value: </span>
                            <span className="text-xs font-bold text-green-600">
                              ${(event.metadata.dealValue / 1000).toFixed(0)}K
                            </span>
                          </div>
                        )}

                        {event.metadata?.oldStatus && event.metadata?.newStatus && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600">{event.metadata.oldStatus}</span>
                            <span className="text-xs text-gray-600 mx-2">→</span>
                            <span className="text-xs font-bold text-blue-600">{event.metadata.newStatus}</span>
                          </div>
                        )}

                        {event.metadata?.attachments && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FileText className="w-3 h-3" />
                            <span>{event.metadata.attachments} attachment(s)</span>
                          </div>
                        )}

                        {/* Outcome */}
                        {event.outcome && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs font-medium text-gray-700">Outcome: </span>
                            <span className="text-xs text-gray-900">{event.outcome}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
