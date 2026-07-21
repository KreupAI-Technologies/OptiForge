'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Save, Mail, MessageSquare, Smartphone, CheckSquare, Volume2, AlertTriangle } from 'lucide-react';
import { ItAdminService, NotificationMetricsDto } from '@/services/it-admin.service';

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  channels: NotificationChannel;
  priority: 'critical' | 'high' | 'medium' | 'low';
  roles: string[];
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [metrics, setMetrics] = useState<NotificationMetricsDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    ItAdminService.getNotificationMetrics()
      .then((m) => {
        if (!cancelled && m) setMetrics(m);
      })
      .catch(() => {
        // keep null; stats fall back to derived counts
      });
    ItAdminService.getNotificationSettings()
      .then((data) => {
        if (cancelled) return;
        const mapped: NotificationSetting[] = (data ?? []).map((dto) => {
          const ch = dto.channels ?? {};
          return {
            id: dto.id,
            category: dto.category,
            name: dto.name,
            description: dto.description ?? '',
            channels: {
              email: !!ch.email,
              sms: !!ch.sms,
              push: !!ch.push,
              inApp: !!ch.inApp,
            },
            priority: (dto.priority as NotificationSetting['priority']) ?? 'low',
            roles: dto.roles ?? [],
          };
        });
        setNotifications(mapped);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    { id: 'all', name: 'All Notifications', icon: Bell, count: notifications.length },
    { id: 'System', name: 'System', icon: AlertTriangle, count: notifications.filter(n => n.category === 'System').length },
    { id: 'User', name: 'User Management', icon: CheckSquare, count: notifications.filter(n => n.category === 'User').length },
    { id: 'Production', name: 'Production', icon: Volume2, count: notifications.filter(n => n.category === 'Production').length },
    { id: 'Inventory', name: 'Inventory', icon: CheckSquare, count: notifications.filter(n => n.category === 'Inventory').length },
    { id: 'Sales', name: 'Sales', icon: CheckSquare, count: notifications.filter(n => n.category === 'Sales').length },
    { id: 'Approval', name: 'Approvals', icon: CheckSquare, count: notifications.filter(n => n.category === 'Approval').length }
  ];

  const toggleChannel = (notificationId: string, channel: keyof NotificationChannel) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? {
              ...notif,
              channels: {
                ...notif.channels,
                [channel]: !notif.channels[channel]
              }
            }
          : notif
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await ItAdminService.saveNotificationSettings(
        notifications.map((n) => ({
          id: n.id,
          category: n.category,
          name: n.name,
          description: n.description,
          channels: {
            email: n.channels.email,
            sms: n.channels.sms,
            push: n.channels.push,
            inApp: n.channels.inApp,
          },
          priority: n.priority,
          roles: n.roles,
        })),
      );
    } catch {
      // best-effort persistence
    }
    setHasChanges(false);
  };

  const filteredNotifications = selectedCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  // Prefer backend-computed delivery metrics (real it_notifications counts);
  // fall back to setting-derived counts when metrics are unavailable.
  const stats = {
    totalNotifications: metrics?.configuredSettings ?? notifications.length,
    emailEnabled:
      metrics?.byChannel?.Email ??
      notifications.filter(n => n.channels.email).length,
    smsEnabled:
      metrics?.byChannel?.SMS ??
      notifications.filter(n => n.channels.sms).length,
    pushEnabled:
      metrics?.byChannel?.Push ??
      notifications.filter(n => n.channels.push).length,
    criticalAlerts:
      metrics?.criticalSettings ??
      notifications.filter(n => n.priority === 'critical').length
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure notification channels and preferences</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Categories Sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Categories</h2>
          <div className="space-y-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`w-4 h-4 ${selectedCategory === category.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                  </div>
                  <p className="text-xs text-gray-600">{category.count} notifications</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900">Statistics</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">Total</span>
                <span className="text-sm font-bold text-blue-900">{stats.totalNotifications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">Email</span>
                <span className="text-sm font-bold text-blue-900">{stats.emailEnabled}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">SMS</span>
                <span className="text-sm font-bold text-blue-900">{stats.smsEnabled}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">Push</span>
                <span className="text-sm font-bold text-blue-900">{stats.pushEnabled}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                <span className="text-xs text-red-700">Critical</span>
                <span className="text-sm font-bold text-red-700">{stats.criticalAlerts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-3">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {selectedCategory === 'all' ? 'All Notifications' : `${selectedCategory} Notifications`}
            </h2>
            <p className="text-sm text-gray-600">Configure which channels should receive each notification type</p>
          </div>

          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{notification.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notification.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Roles:</span>
                      <div className="flex flex-wrap gap-1">
                        {notification.roles.map((role) => (
                          <span key={role} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Notification Channels:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => toggleChannel(notification.id, 'email')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        notification.channels.email
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Mail className={`w-5 h-5 ${notification.channels.email ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium text-gray-900">Email</span>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleChannel(notification.id, 'sms')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        notification.channels.sms
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className={`w-5 h-5 ${notification.channels.sms ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium text-gray-900">SMS</span>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleChannel(notification.id, 'push')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        notification.channels.push
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Smartphone className={`w-5 h-5 ${notification.channels.push ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium text-gray-900">Push</span>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleChannel(notification.id, 'inApp')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        notification.channels.inApp
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Bell className={`w-5 h-5 ${notification.channels.inApp ? 'text-orange-600' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium text-gray-900">In-App</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No notifications found</p>
              <p className="text-sm text-gray-500">Try selecting a different category</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Notification Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Email:</strong> Best for detailed information and non-urgent updates</li>
              <li>• <strong>SMS:</strong> Use for critical alerts requiring immediate attention</li>
              <li>• <strong>Push:</strong> Mobile notifications for real-time updates</li>
              <li>• <strong>In-App:</strong> Notifications visible when users are logged in</li>
              <li>• Critical priority notifications are sent across all enabled channels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
