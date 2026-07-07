'use client';

import React, { useState, useEffect } from 'react';
import {
  RealTimeCollaborationPanel,
  TeamChatIntegration,
  HandoffChecklists,
  CrossFunctionalTimeline,
  CustomerPortal
} from '@/components/industry4';
import { collaborationService, type TeamActivity } from '@/services/collaboration.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'default-company-id';

type CollaborationTab = 'overview' | 'team' | 'chat' | 'handoff' | 'timeline' | 'customer';

interface CollabOverviewStats {
  teamOnline: number;
  teamTotal: number;
  activeConversations: number;
  unreadMessages: number;
  pendingHandoffs: number;
  customerApprovals: number;
}

interface CollabActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

function toRelativeTime(value?: string | Date): string {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initialsOf(name?: string): string {
  if (!name) return '??';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function CollaborationDashboardPage() {
  const [activeTab, setActiveTab] = useState<CollaborationTab>('overview');

  const DEFAULT_STATS: CollabOverviewStats = {
    teamOnline: 12,
    teamTotal: 18,
    activeConversations: 8,
    unreadMessages: 3,
    pendingHandoffs: 2,
    customerApprovals: 3,
  };

  const DEFAULT_ACTIVITY: CollabActivityItem[] = [
    { id: '1', user: 'Sarah Chen', avatar: 'SC', action: 'completed milestone', target: 'Phase 1 Inspection', time: '5m ago', type: 'milestone' },
    { id: '2', user: 'Mike Rodriguez', avatar: 'MR', action: 'uploaded', target: 'QC Report #547', time: '15m ago', type: 'document' },
    { id: '3', user: 'James Park', avatar: 'JP', action: 'started shift handoff', target: 'Morning → Afternoon', time: '20m ago', type: 'handoff' },
    { id: '4', user: 'Emily Watson', avatar: 'EW', action: 'approved', target: 'Material Order #892', time: '35m ago', type: 'approval' },
    { id: '5', user: 'David Kim', avatar: 'DK', action: 'commented on', target: 'Work Order #1547', time: '45m ago', type: 'comment' },
    { id: '6', user: 'Lisa Thompson', avatar: 'LT', action: 'updated', target: 'Design Drawing v2.3', time: '1h ago', type: 'update' },
  ];

  const [stats, setStats] = useState<CollabOverviewStats>(DEFAULT_STATS);
  const [activityFeed, setActivityFeed] = useState<CollabActivityItem[]>(DEFAULT_ACTIVITY);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadError(null);
      try {
        const [activeUsers, pendingHandoffs, customerAccess, recent] = await Promise.all([
          collaborationService.getActiveUsers(COMPANY_ID).catch(() => []),
          collaborationService.getPendingHandoffs(COMPANY_ID).catch(() => []),
          collaborationService
            .getCustomerPortalAccesses({ companyId: COMPANY_ID, approvalStatus: 'pending' })
            .catch(() => []),
          collaborationService.getRecentActivity(COMPANY_ID, 6).catch(() => [] as TeamActivity[]),
        ]);

        if (cancelled) return;

        const users = Array.isArray(activeUsers) ? activeUsers : [];
        const handoffs = Array.isArray(pendingHandoffs) ? pendingHandoffs : [];
        const approvals = Array.isArray(customerAccess) ? customerAccess : [];
        const recentArr = Array.isArray(recent) ? recent : [];

        setStats({
          teamOnline: users.length || DEFAULT_STATS.teamOnline,
          teamTotal: Math.max(users.length, DEFAULT_STATS.teamTotal),
          activeConversations: recentArr.length || DEFAULT_STATS.activeConversations,
          unreadMessages: DEFAULT_STATS.unreadMessages,
          pendingHandoffs: handoffs.length,
          customerApprovals: approvals.length,
        });

        if (recentArr.length > 0) {
          setActivityFeed(
            recentArr.map((a: any) => ({
              id: a.id ?? Math.random().toString(),
              user: a.userName ?? 'Unknown',
              avatar: initialsOf(a.userName),
              action: a.activityType ?? 'updated',
              target: a.resourceName ?? a.activityDescription ?? '',
              time: toRelativeTime(a.activityAt ?? a.createdAt),
              type: a.activityType ?? 'update',
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load collaboration data');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs: { id: CollaborationTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'team', label: 'Team Activity', icon: '👥' },
    { id: 'chat', label: 'Team Chat', icon: '💬' },
    { id: 'handoff', label: 'Shift Handoff', icon: '🔄' },
    { id: 'timeline', label: 'Project Timeline', icon: '📅' },
    { id: 'customer', label: 'Customer Portal', icon: '🌐' },
  ];

  const renderOverview = () => (
    <div className="space-y-3">
      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Team Online</p>
              <p className="text-4xl font-bold mt-1">{stats.teamOnline}</p>
              <p className="text-blue-100 text-xs mt-2">of {stats.teamTotal} team members</p>
            </div>
            <div className="text-3xl opacity-80">👥</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Active Conversations</p>
              <p className="text-4xl font-bold mt-1">{stats.activeConversations}</p>
              <p className="text-green-100 text-xs mt-2">{stats.unreadMessages} unread messages</p>
            </div>
            <div className="text-3xl opacity-80">💬</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm">Pending Handoffs</p>
              <p className="text-4xl font-bold mt-1">{stats.pendingHandoffs}</p>
              <p className="text-amber-100 text-xs mt-2">Awaiting acknowledgement</p>
            </div>
            <div className="text-3xl opacity-80">🔄</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Customer Approvals</p>
              <p className="text-4xl font-bold mt-1">{stats.customerApprovals}</p>
              <p className="text-purple-100 text-xs mt-2">Awaiting response</p>
            </div>
            <div className="text-3xl opacity-80">✓</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Team Activity - Compact */}
        <div className="col-span-1">
          <RealTimeCollaborationPanel compact />

          {/* Quick Actions */}
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('chat')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">💬</div>
                <div>
                  <div className="font-medium text-sm">Start Chat</div>
                  <div className="text-xs text-gray-500">Message your team</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('handoff')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-xl">🔄</div>
                <div>
                  <div className="font-medium text-sm">Shift Handoff</div>
                  <div className="text-xs text-gray-500">Start handoff checklist</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">📅</div>
                <div>
                  <div className="font-medium text-sm">View Timeline</div>
                  <div className="text-xs text-gray-500">Project milestones</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity Feed</h3>
            {loadError && (
              <p className="text-xs text-amber-600 mb-2">Live feed unavailable — showing recent samples.</p>
            )}
            <div className="space-y-2">
              {activityFeed.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">No recent activity.</p>
              )}
              {activityFeed.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action} </span>
                      <span className="font-medium text-blue-600">{activity.target}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{activity.time}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {activity.type === 'milestone' && <span className="text-lg">🎯</span>}
                    {activity.type === 'document' && <span className="text-lg">📄</span>}
                    {activity.type === 'handoff' && <span className="text-lg">🔄</span>}
                    {activity.type === 'approval' && <span className="text-lg">✓</span>}
                    {activity.type === 'comment' && <span className="text-lg">💬</span>}
                    {activity.type === 'update' && <span className="text-lg">📝</span>}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              View All Activity →
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('timeline')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">📅</div>
            <div>
              <h3 className="font-semibold text-gray-800">Cross-Functional Timeline</h3>
              <p className="text-sm text-gray-500">Unified view of all project milestones</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">5</div>
              <div className="text-xs text-gray-500">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">12</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">3</div>
              <div className="text-xs text-gray-500">Upcoming</div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab('customer')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">🌐</div>
            <div>
              <h3 className="font-semibold text-gray-800">Customer Portal</h3>
              <p className="text-sm text-gray-500">Client-facing project status & approvals</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">8</div>
              <div className="text-xs text-gray-500">Active Orders</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">3</div>
              <div className="text-xs text-gray-500">Pending Approvals</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">15</div>
              <div className="text-xs text-gray-500">Documents Shared</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Production</span>
          <span>/</span>
          <span className="text-gray-800">Collaborative Manufacturing</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Collaborative Manufacturing</h1>
            <p className="text-gray-600 mt-1">Real-time team collaboration, communication, and customer engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['SC', 'MR', 'JP', 'EW', 'DK'].map((avatar, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                >
                  {avatar}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                +7
              </div>
            </div>
            <span className="text-sm text-gray-500">12 online</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'team' && <RealTimeCollaborationPanel />}
      {activeTab === 'chat' && <TeamChatIntegration />}
      {activeTab === 'handoff' && <HandoffChecklists />}
      {activeTab === 'timeline' && <CrossFunctionalTimeline />}
      {activeTab === 'customer' && <CustomerPortal />}
    </div>
  );
}
