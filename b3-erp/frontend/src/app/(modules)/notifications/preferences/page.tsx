'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  ArrowLeft,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Clock,
  AlertCircle,
  MessageSquare,
  UserCheck,
  RefreshCw,
  Settings,
  Save,
  Moon,
  Sun,
  CheckCircle,
} from 'lucide-react';
import { useNotifications, NotificationCategory, NotificationPreferences } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { userNotificationService } from '@/services/notification.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// Category Config
// ============================================================================

const categoryConfig: Record<NotificationCategory, {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  alert: {
    icon: AlertCircle,
    label: 'Alerts',
    description: 'System alerts, errors, and warnings',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  approval: {
    icon: UserCheck,
    label: 'Approvals',
    description: 'Approval requests and status updates',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  mention: {
    icon: MessageSquare,
    label: 'Mentions',
    description: 'When someone mentions you in comments',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  update: {
    icon: RefreshCw,
    label: 'Updates',
    description: 'Status updates and changes',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  reminder: {
    icon: Clock,
    label: 'Reminders',
    description: 'Scheduled reminders and deadlines',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  system: {
    icon: Bell,
    label: 'System',
    description: 'System notifications and announcements',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

// ============================================================================
// Module Config
// ============================================================================

const moduleConfig = [
  { id: 'project-management', label: 'Project Management', description: 'Project updates and milestones' },
  { id: 'sales', label: 'Sales & CRM', description: 'Lead and opportunity notifications' },
  { id: 'procurement', label: 'Procurement', description: 'PO and vendor notifications' },
  { id: 'production', label: 'Production', description: 'Work order and scheduling alerts' },
  { id: 'quality', label: 'Quality', description: 'Inspection and NCR notifications' },
  { id: 'inventory', label: 'Inventory', description: 'Stock alerts and movements' },
  { id: 'finance', label: 'Finance', description: 'Invoice and payment notifications' },
  { id: 'hr', label: 'HR', description: 'Leave and attendance notifications' },
];

// ============================================================================
// Notification Preferences Page
// ============================================================================

export default function NotificationPreferencesPage() {
  const { preferences, updatePreferences, requestPushPermission, isPushSupported, isPushEnabled } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();

  const userId = user?.id || 'demo-user';

  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences from the notifications backend on mount. Falls back
  // to the context (localStorage) preferences if the API is unavailable.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    userNotificationService
      .getPreferences<NotificationPreferences>(userId)
      .then((res) => {
        if (!active) return;
        const remote = res?.preferences;
        if (remote && typeof remote === 'object' && 'enabled' in remote) {
          // Merge onto defaults/context so any missing nested keys stay defined.
          const merged: NotificationPreferences = {
            ...preferences,
            ...remote,
            categories: { ...preferences.categories, ...(remote.categories || {}) },
            modules: { ...preferences.modules, ...(remote.modules || {}) },
            quietHours: { ...preferences.quietHours, ...(remote.quietHours || {}) },
          };
          setLocalPrefs(merged);
        }
      })
      .catch((err) => {
        console.error('Failed to load notification preferences, using local:', err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleChange = (path: string, value: unknown) => {
    setLocalPrefs(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let obj: Record<string, unknown> = newPrefs;

      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof obj[keys[i]] === 'object' && obj[keys[i]] !== null) {
          obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) };
          obj = obj[keys[i]] as Record<string, unknown>;
        }
      }

      obj[keys[keys.length - 1]] = value;
      return newPrefs;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Keep the local context (localStorage) in sync for instant UX.
    updatePreferences(localPrefs);

    try {
      await userNotificationService.savePreferences<NotificationPreferences>(userId, localPrefs);
      setHasChanges(false);
      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      toast({
        title: 'Save failed',
        description:
          'Could not reach the notifications service. Your changes are kept in this browser but not synced.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      handleChange('pushEnabled', true);
      toast({
        title: 'Push notifications enabled',
        description: 'You will now receive browser push notifications.',
      });
    } else {
      toast({
        title: 'Permission denied',
        description: 'Push notifications were blocked. Please enable them in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full py-2 space-y-3 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/notifications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Notification Preferences
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Customize how and when you receive notifications. Your preferences
              are saved to your account and synced across devices.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving || isLoading}>
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Master Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-full ${localPrefs.enabled ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center`}>
                <Bell className={`w-6 h-6 ${localPrefs.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enable Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications across all channels</p>
              </div>
            </div>
            <Checkbox
              checked={localPrefs.enabled}
              onChange={(checked) => handleChange('enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Push Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive browser push notifications for critical alerts</p>
              </div>
            </div>
            {isPushSupported ? (
              isPushEnabled ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Checkbox
                    checked={localPrefs.pushEnabled}
                    onChange={(checked) => handleChange('pushEnabled', checked)}
                  />
                </div>
              ) : (
                <Button onClick={handleEnablePush} variant="outline" size="sm">
                  Enable Push
                </Button>
              )
            ) : (
              <span className="text-sm text-gray-400">Not supported in this browser</span>
            )}
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                {localPrefs.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-orange-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sound Effects</h4>
                <p className="text-sm text-gray-500">Play sound for new notifications</p>
              </div>
            </div>
            <Checkbox
              checked={localPrefs.soundEnabled}
              onChange={(checked) => handleChange('soundEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>Pause notifications during specific hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Quiet Hours</h4>
              <p className="text-sm text-gray-500">Silence non-critical notifications</p>
            </div>
            <Checkbox
              checked={localPrefs.quietHours.enabled}
              onChange={(checked) => handleChange('quietHours.enabled', checked)}
            />
          </div>

          {localPrefs.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={localPrefs.quietHours.start}
                  onChange={(e) => handleChange('quietHours.start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={localPrefs.quietHours.end}
                  onChange={(e) => handleChange('quietHours.end', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>Configure preferences for each type of notification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(Object.keys(categoryConfig) as NotificationCategory[]).map(category => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              const catPrefs = localPrefs.categories[category];

              return (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{config.label}</h4>
                        <p className="text-sm text-gray-500">{config.description}</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={catPrefs.enabled}
                      onChange={(checked) => handleChange(`categories.${category}.enabled`, checked)}
                    />
                  </div>

                  {catPrefs.enabled && (
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t ml-13">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Push notifications</span>
                        <Checkbox
                          checked={catPrefs.push}
                          onChange={(checked) => handleChange(`categories.${category}.push`, checked)}
                          disabled={!localPrefs.pushEnabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sound</span>
                        <Checkbox
                          checked={catPrefs.sound}
                          onChange={(checked) => handleChange(`categories.${category}.sound`, checked)}
                          disabled={!localPrefs.soundEnabled}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Module Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Module Notifications</CardTitle>
          <CardDescription>Choose which modules can send you notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {moduleConfig.map(module => (
              <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{module.label}</h4>
                  <p className="text-sm text-gray-500">{module.description}</p>
                </div>
                <Checkbox
                  checked={localPrefs.modules[module.id] !== false}
                  onChange={(checked) => handleChange(`modules.${module.id}`, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Mobile) */}
      <div className="lg:hidden sticky bottom-4">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving || isLoading} className="w-full">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
