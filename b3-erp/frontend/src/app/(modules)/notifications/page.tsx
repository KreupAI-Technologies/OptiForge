'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  MessageSquare,
  UserCheck,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react';
import {
  userNotificationService,
  UserNotification,
} from '@/services/notification.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================================================
// Category / Priority Config (maps backend fields to display styling)
// ============================================================================

type DisplayCategory = 'alert' | 'approval' | 'mention' | 'update' | 'reminder' | 'system';

const categoryConfig: Record<DisplayCategory, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  alert: { icon: AlertCircle, label: 'Alerts', color: 'text-red-600', bgColor: 'bg-red-100' },
  approval: { icon: UserCheck, label: 'Approvals', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  mention: { icon: MessageSquare, label: 'Mentions', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  update: { icon: RefreshCw, label: 'Updates', color: 'text-green-600', bgColor: 'bg-green-100' },
  reminder: { icon: Clock, label: 'Reminders', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  system: { icon: Bell, label: 'System', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

// Backend `type` strings -> display category bucket
function toDisplayCategory(type: string): DisplayCategory {
  const t = (type || '').toLowerCase();
  if (t.includes('approval') || t.includes('escalation')) return 'approval';
  if (t.includes('sla') || t.includes('breach') || t.includes('error') || t.includes('alert')) return 'alert';
  if (t.includes('mention')) return 'mention';
  if (t.includes('reminder') || t.includes('deadline')) return 'reminder';
  if (t.includes('update') || t.includes('status')) return 'update';
  return 'system';
}

// Backend `priority` ('info' | 'warning' | 'urgent') display
function priorityBadge(priority: string): { label: string; className: string } | null {
  const p = (priority || '').toLowerCase();
  if (p === 'urgent') return { label: 'Urgent', className: 'bg-red-100 text-red-700' };
  if (p === 'warning') return { label: 'Warning', className: 'bg-orange-100 text-orange-700' };
  return null;
}

// ============================================================================
// Format Time Helper
// ============================================================================

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================================================
// Notification History Page
// ============================================================================

export default function NotificationHistoryPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DisplayCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await userNotificationService.getForUser(userId, 1, 100);
      setNotifications(res.notifications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const handleMarkAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    // optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await userNotificationService.markRead(id, userId);
    } catch {
      // revert on failure by reloading truth from server
      void loadNotifications();
    }
  }, [userId, loadNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    setIsMutating(true);
    try {
      await userNotificationService.markAllRead(userId);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setIsMutating(false);
    }
  }, [userId, loadNotifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !n.title.toLowerCase().includes(search) &&
          !n.message.toLowerCase().includes(search) &&
          !n.type.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (categoryFilter !== 'all' && toDisplayCategory(n.type) !== categoryFilter) {
        return false;
      }

      if (statusFilter === 'unread' && n.isRead) return false;
      if (statusFilter === 'read' && !n.isRead) return false;

      if (dateFilter !== 'all') {
        const now = new Date();
        const notifDate = new Date(n.createdAt);
        const daysDiff = Math.floor((now.getTime() - notifDate.getTime()) / 86400000);
        if (dateFilter === 'today' && daysDiff > 0) return false;
        if (dateFilter === 'week' && daysDiff > 7) return false;
        if (dateFilter === 'month' && daysDiff > 30) return false;
      }

      return true;
    });
  }, [notifications, searchTerm, categoryFilter, statusFilter, dateFilter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: UserNotification[] } = {};

    filteredNotifications.forEach((n) => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
  };

  const hasActiveFilters =
    searchTerm !== '' || categoryFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all';

  return (
    <div className="w-full py-2 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notification History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadNotifications} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isMutating}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
          <Link href="/notifications/preferences">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </span>
          <Button variant="ghost" size="sm" onClick={loadNotifications}>
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.unread > 0 ? 'bg-blue-50 border-blue-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Read</p>
                <p className="text-2xl font-bold">{stats.read}</p>
              </div>
              <Check className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={(v: string) => setCategoryFilter(v as DisplayCategory | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.keys(categoryConfig) as DisplayCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      {React.createElement(categoryConfig[cat].icon, { className: 'w-4 h-4' })}
                      {categoryConfig[cat].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as 'all' | 'unread' | 'read')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(v: string) => setDateFilter(v as 'all' | 'today' | 'week' | 'month')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mb-2" />
              <p className="text-gray-500 font-medium">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <Bell className="w-16 h-16 text-gray-200 mb-2" />
              <p className="text-gray-500 font-medium">No notifications found</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasActiveFilters ? 'Try adjusting your filters' : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <span className="text-sm text-gray-600">
                  {filteredNotifications.length} notification(s)
                </span>
              </div>

              {Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
                <div key={dateGroup}>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {dateGroup}
                    </span>
                  </div>
                  {notifs.map((notification) => {
                    const displayCat = toDisplayCategory(notification.type);
                    const config = categoryConfig[displayCat];
                    const Icon = config.icon;
                    const badge = priorityBadge(notification.priority);

                    return (
                      <div
                        key={notification.id}
                        className={`
                          group px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all
                          ${!notification.isRead ? 'bg-blue-50/50' : ''}
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                                )}
                                <span className="text-xs text-gray-400" title={formatFullDate(notification.createdAt)}>
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${config.bgColor} ${config.color}`}>
                                {config.label}
                              </span>
                              {badge && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${badge.className}`}>
                                  {badge.label}
                                </span>
                              )}
                            </div>

                            {notification.actionUrl && (
                              <div className="flex gap-2 mt-3">
                                <Link
                                  href={notification.actionUrl}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  View
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
