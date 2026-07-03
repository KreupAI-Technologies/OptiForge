'use client';

import { useState, useEffect } from 'react';
import { crmService } from '@/services/crm.service';
import { Phone, Plus, Search, Clock, User, CheckCircle, XCircle, PhoneMissed, PhoneIncoming, PhoneOutgoing, BarChart3, TrendingUp, Calendar, Edit, Trash2, Eye, FileText } from 'lucide-react';

interface Call {
  id: string;
  subject: string;
  description: string;
  type: 'outbound' | 'inbound' | 'missed';
  status: 'completed' | 'scheduled' | 'missed' | 'cancelled';
  callType: 'discovery' | 'follow-up' | 'demo' | 'support' | 'closing' | 'cold-call';
  scheduledTime: string;
  duration?: number;
  caller: string;
  recipient: string;
  relatedTo: string;
  relatedType: 'lead' | 'opportunity' | 'customer';
  outcome?: 'positive' | 'neutral' | 'negative' | 'no-answer';
  nextSteps?: string[];
  notes?: string;
  recordingUrl?: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await crmService.activityRecords.getAll({ type: 'call' });
        const rows = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setCalls(rows.map((r: any): Call => ({
          id: String(r.id ?? ''),
          subject: r.subject ?? '',
          description: r.description ?? '',
          type: (r.direction ?? 'outbound') as Call['type'],
          status: (r.status ?? 'completed') as Call['status'],
          callType: (r.callType ?? 'follow-up') as Call['callType'],
          scheduledTime: r.scheduledAt ?? r.dueDate ?? r.createdAt ?? '',
          duration: r.durationMinutes ?? 0,
          caller: r.assignedTo ?? '',
          recipient: r.contactName ?? '',
          relatedTo: r.relatedTo ?? '',
          relatedType: (r.relatedType ?? 'lead') as Call['relatedType'],
          outcome: (r.outcome ?? undefined) as Call['outcome'],
          nextSteps: Array.isArray(r.tags) ? r.tags : [],
          notes: r.description ?? '',
          recordingUrl: r.meetingLink ?? undefined,
        })));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load');
        setCalls([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'scheduled' | 'missed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'outbound' | 'inbound' | 'missed'>('all');
  const [filterCallType, setFilterCallType] = useState<'all' | 'discovery' | 'follow-up' | 'demo' | 'support' | 'closing' | 'cold-call'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'outcome'>('date');

  const filteredCalls = calls
    .filter(call => {
      const matchesSearch = call.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          call.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          call.relatedTo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
      const matchesType = filterType === 'all' || call.type === filterType;
      const matchesCallType = filterCallType === 'all' || call.callType === filterCallType;
      return matchesSearch && matchesStatus && matchesType && matchesCallType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime();
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'outcome':
          return (a.outcome || '').localeCompare(b.outcome || '');
        default:
          return 0;
      }
    });

  const stats = {
    total: calls.length,
    completed: calls.filter(c => c.status === 'completed').length,
    scheduled: calls.filter(c => c.status === 'scheduled').length,
    missed: calls.filter(c => c.status === 'missed').length,
    totalMinutes: calls.filter(c => c.duration).reduce((sum, c) => sum + (c.duration || 0), 0),
    avgDuration: calls.filter(c => c.duration).length
      ? calls.filter(c => c.duration).reduce((sum, c) => sum + (c.duration || 0), 0) / calls.filter(c => c.duration).length
      : 0,
    positiveOutcome: calls.filter(c => c.outcome === 'positive').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'missed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'outbound':
        return <PhoneOutgoing className="w-4 h-4" />;
      case 'inbound':
        return <PhoneIncoming className="w-4 h-4" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'positive':
        return 'bg-green-100 text-green-700';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-700';
      case 'negative':
        return 'bg-red-100 text-red-700';
      case 'no-answer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>)}
      <div className="mb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Phone className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-blue-100">Total Calls</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.completed}</div>
            <div className="text-green-100">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.scheduled}</div>
            <div className="text-purple-100">Scheduled</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <PhoneMissed className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.missed}</div>
            <div className="text-red-100">Missed</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalMinutes}m</div>
            <div className="text-orange-100">Total Minutes</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgDuration.toFixed(0)}m</div>
            <div className="text-teal-100">Avg Duration</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.positiveOutcome}</div>
            <div className="text-pink-100">Positive</div>
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
                  placeholder="Search calls..."
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
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="missed">Missed</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Directions</option>
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
                <option value="missed">Missed</option>
              </select>

              <select
                value={filterCallType}
                onChange={(e) => setFilterCallType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="discovery">Discovery</option>
                <option value="follow-up">Follow-up</option>
                <option value="demo">Demo</option>
                <option value="support">Support</option>
                <option value="closing">Closing</option>
                <option value="cold-call">Cold Call</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="duration">Sort by Duration</option>
                <option value="outcome">Sort by Outcome</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calls List */}
      <div className="space-y-2">
        {filteredCalls.map((call) => (
          <div key={call.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{call.subject}</h3>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                    {getTypeIcon(call.type)}
                    {call.type} - {call.status}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {call.callType}
                  </span>
                  {call.outcome && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                      {call.outcome}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{call.description}</p>

                {/* Call Details Grid */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Date & Time
                    </div>
                    <div className="font-medium text-gray-900">
                      {new Date(call.scheduledTime).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(call.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Duration
                    </div>
                    <div className="font-medium text-gray-900">
                      {call.duration ? `${call.duration} minutes` : 'Not set'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                      <User className="w-4 h-4" />
                      Participants
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{call.caller}</div>
                      <div className="text-gray-600">→ {call.recipient}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-600 text-sm mb-1">Related To</div>
                    <div className="font-medium text-gray-900">{call.relatedTo}</div>
                    <div className="text-xs text-gray-500">{call.relatedType}</div>
                  </div>
                </div>

                {/* Next Steps */}
                {call.nextSteps && call.nextSteps.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Next Steps:</div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {call.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {call.notes && (
                  <div className="mb-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Notes:
                    </div>
                    <p className="text-sm text-gray-600">{call.notes}</p>
                  </div>
                )}

                {/* Recording */}
                {call.recordingUrl && (
                  <a
                    href={call.recordingUrl}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    Listen to Recording
                  </a>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  aria-label="View"
                 
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  aria-label="Edit"
                 
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-2 border border-red-300 rounded-lg hover:bg-red-50"
                  aria-label="Delete"
                 
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCalls.length === 0 && (
        <div className="text-center py-12">
          <Phone className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
