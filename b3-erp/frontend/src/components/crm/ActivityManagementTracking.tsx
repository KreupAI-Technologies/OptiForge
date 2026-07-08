'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Phone, Mail, Calendar, CheckCircle2, MessageSquare, FileText, Clock, TrendingUp, Users, Target, Bell } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';
import CrmDataState from './CrmDataState';

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description: string;
  relatedTo: string;
  relatedType: 'lead' | 'contact' | 'account' | 'opportunity';
  assignedTo: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'overdue';
  duration?: number;
  outcome?: string;
  emailOpened?: boolean;
  timestamp: string;
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle2,
  note: FileText
};

const activityColors = {
  call: 'bg-blue-100 text-blue-700 border-blue-300',
  email: 'bg-purple-100 text-purple-700 border-purple-300',
  meeting: 'bg-green-100 text-green-700 border-green-300',
  task: 'bg-orange-100 text-orange-700 border-orange-300',
  note: 'bg-gray-100 text-gray-700 border-gray-300'
};

const statusColors = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700'
};

export default function ActivityManagementTracking() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [realTimeUpdate, setRealTimeUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdate(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await crmService.activities.getAll();
        const rows = asArray<any>(res);
        const mapped: Activity[] = rows.map((a: any) => ({
          id: String(a.id ?? ''),
          type: (a.type ?? 'note') as Activity['type'],
          subject: a.subject ?? '',
          description: a.description ?? '',
          relatedTo: a.customerName ?? a.relatedTo ?? '',
          relatedType: (a.relatedType ?? (a.opportunityId ? 'opportunity' : a.contactId ? 'contact' : a.leadId ? 'lead' : 'account')) as Activity['relatedType'],
          assignedTo: a.assignedToName ?? a.assignedTo ?? '',
          dueDate: a.dueDate ?? a.startDate ?? '',
          status: (a.status === 'completed' || a.status === 'pending' || a.status === 'overdue' ? a.status : (a.completedDate ? 'completed' : 'pending')) as Activity['status'],
          duration: a.duration ?? undefined,
          outcome: a.outcome ?? undefined,
          emailOpened: a.emailOpened ?? undefined,
          timestamp: a.createdAt ?? a.updatedAt ?? '',
        }));
        if (mounted) { setActivities(mapped); setError(null); }
      } catch (e) {
        if (mounted) { setActivities([]); setError(e instanceof Error ? e.message : 'Failed to load activities'); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filterType !== 'all' && activity.type !== filterType) return false;
    if (filterStatus !== 'all' && activity.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    totalActivities: activities.length,
    completedToday: activities.filter(a => a.status === 'completed' && a.timestamp.includes('hours')).length,
    pendingTasks: activities.filter(a => a.status === 'pending').length,
    overdueTasks: activities.filter(a => a.status === 'overdue').length,
    callsMade: activities.filter(a => a.type === 'call').length,
    emailsSent: activities.filter(a => a.type === 'email').length,
    emailOpenRate: activities.filter(a => a.type === 'email' && a.emailOpened).length / Math.max(activities.filter(a => a.type === 'email').length, 1) * 100
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Activity className="h-8 w-8 text-green-600 mr-3" />
          Activity Management & Tracking
        </h2>
        <p className="text-gray-600 mt-1">Email tracking, call logging, meeting scheduling with comprehensive activity timeline</p>
      </div>

      <CrmDataState
        loading={loading}
        error={error}
        empty={!loading && !error && activities.length === 0}
        loadingText="Loading activities…"
        emptyText="No activities found."
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Activities</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalActivities}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completedToday}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingTasks}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdueTasks}</p>
            </div>
            <Bell className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Calls Made</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.callsMade}</p>
            </div>
            <Phone className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Emails Sent</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.emailsSent}</p>
            </div>
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">Email Open Rate</p>
              <p className="text-2xl font-bold text-teal-900 mt-1">{stats.emailOpenRate.toFixed(0)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Phone className="h-4 w-4" />
            <span>Log Call</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Schedule Meeting</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <CheckCircle2 className="h-4 w-4" />
            <span>Create Task</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="task">Tasks</option>
            <option value="note">Notes</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="flex-1"></div>
          <span className="text-sm text-gray-600">{filteredActivities.length} activities</span>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <Clock className="h-5 w-5 text-green-600 mr-2" />
          Activity Timeline
        </h3>

        <div className="space-y-2">
          {filteredActivities.map((activity, index) => {
            const ActivityIcon = activityIcons[activity.type] ?? FileText;
            const isLast = index === filteredActivities.length - 1;

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
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-sm font-bold text-gray-900">{activity.subject}</h4>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusColors[activity.status]}`}>
                            {activity.status}
                          </span>
                          {activity.emailOpened && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              Email Opened
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>👤 {activity.assignedTo}</span>
                          <span>🔗 {activity.relatedTo}</span>
                          <span>📅 {activity.dueDate}</span>
                          <span>🕒 {activity.timestamp}</span>
                        </div>
                        {activity.duration && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>Duration: {activity.duration} minutes</span>
                          </div>
                        )}
                        {activity.outcome && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                            <Target className="h-3 w-3" />
                            <span>Outcome: {activity.outcome}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Activity Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            Activity by Team Member
          </h3>
          <div className="space-y-3">
            {['Sarah Johnson', 'Michael Chen', 'David Park', 'Emily Davis'].map((member) => {
              const memberActivities = activities.filter(a => a.assignedTo === member).length;
              return (
                <div key={member} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{member}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(memberActivities / activities.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{memberActivities}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
            <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
            Activity Type Breakdown
          </h3>
          <div className="space-y-3">
            {['call', 'email', 'meeting', 'task', 'note'].map((type) => {
              const typeActivities = activities.filter(a => a.type === type).length;
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${activityColors[type as keyof typeof activityColors].split(' ')[0]}`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}s</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${activityColors[type as keyof typeof activityColors].split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}
                        style={{ width: `${(typeActivities / activities.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{typeActivities}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
