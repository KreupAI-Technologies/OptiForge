'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Save, Send, CheckCircle, XCircle, Server, Lock, AlertCircle, TestTube } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface EmailSettings {
  smtp: {
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: 'none' | 'ssl' | 'tls';
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
  };
  templates: {
    header: string;
    footer: string;
    primaryColor: string;
    logo: boolean;
  };
  limits: {
    dailyLimit: number;
    hourlyLimit: number;
    rateLimitPerMinute: number;
  };
  settings: {
    enableEmailNotifications: boolean;
    enableMarketingEmails: boolean;
    enableTransactionalEmails: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
    unsubscribeLink: boolean;
  };
}

export default function EmailSettingsPage() {
  const router = useRouter();
  const [hasChanges, setHasChanges] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmail, setTestEmail] = useState('');

  const [settings, setSettings] = useState<EmailSettings>({
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      username: 'noreply@b3manufacturing.com',
      password: '••••••••••••',
      encryption: 'tls',
      fromName: 'B3 Manufacturing',
      fromEmail: 'noreply@b3manufacturing.com',
      replyToEmail: 'support@b3manufacturing.com'
    },
    templates: {
      header: 'B3 Manufacturing Solutions',
      footer: '© 2024 B3 Manufacturing. All rights reserved.',
      primaryColor: '#3B82F6',
      logo: true
    },
    limits: {
      dailyLimit: 10000,
      hourlyLimit: 500,
      rateLimitPerMinute: 20
    },
    settings: {
      enableEmailNotifications: true,
      enableMarketingEmails: true,
      enableTransactionalEmails: true,
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true
    }
  });

  useEffect(() => {
    let cancelled = false;
    ItAdminService.getConfigValue('it.system.email')
      .then((res) => {
        if (cancelled) return;
        if (res && res.value) {
          setSettings((prev) => ({ ...prev, ...(res.value as Partial<EmailSettings>) }));
        }
      })
      .catch(() => {
        // no stored config yet; keep defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (section: keyof EmailSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await ItAdminService.setConfigValue('it.system.email', settings);
    } catch {
      // best-effort persistence
    }
    setHasChanges(false);
  };

  const sendTestEmail = async () => {
    setTestStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 2000);
  };

  const emailStats = {
    sent24h: 1247,
    sentThisMonth: 18543,
    deliveryRate: 98.5,
    openRate: 42.3,
    clickRate: 12.8,
    bounceRate: 1.2
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure SMTP server and email preferences</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-3">
          {/* SMTP Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">SMTP Configuration</h2>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host *</label>
                  <input
                    type="text"
                    value={settings.smtp.host}
                    onChange={(e) => handleChange('smtp', 'host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port *</label>
                  <input
                    type="number"
                    value={settings.smtp.port}
                    onChange={(e) => handleChange('smtp', 'port', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    value={settings.smtp.username}
                    onChange={(e) => handleChange('smtp', 'username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password *
                  </label>
                  <input
                    type="password"
                    value={settings.smtp.password}
                    onChange={(e) => handleChange('smtp', 'password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Encryption *</label>
                <div className="flex gap-2">
                  {(['none', 'ssl', 'tls'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="encryption"
                        value={type}
                        checked={settings.smtp.encryption === type}
                        onChange={(e) => handleChange('smtp', 'encryption', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{type.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  Common SMTP Ports: 25 (unencrypted), 465 (SSL), 587 (TLS), 2525 (alternative)
                </p>
              </div>
            </div>
          </div>

          {/* Sender Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Sender Information</h2>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name *</label>
                  <input
                    type="text"
                    value={settings.smtp.fromName}
                    onChange={(e) => handleChange('smtp', 'fromName', e.target.value)}
                    placeholder="B3 Manufacturing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email *</label>
                  <input
                    type="email"
                    value={settings.smtp.fromEmail}
                    onChange={(e) => handleChange('smtp', 'fromEmail', e.target.value)}
                    placeholder="noreply@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Email</label>
                <input
                  type="email"
                  value={settings.smtp.replyToEmail}
                  onChange={(e) => handleChange('smtp', 'replyToEmail', e.target.value)}
                  placeholder="support@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Email Template Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Email Templates</h2>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                <input
                  type="text"
                  value={settings.templates.header}
                  onChange={(e) => handleChange('templates', 'header', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                <input
                  type="text"
                  value={settings.templates.footer}
                  onChange={(e) => handleChange('templates', 'footer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.templates.primaryColor}
                      onChange={(e) => handleChange('templates', 'primaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.templates.primaryColor}
                      onChange={(e) => handleChange('templates', 'primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.templates.logo}
                      onChange={(e) => handleChange('templates', 'logo', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Company Logo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">Rate Limits</h2>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Limit</label>
                  <input
                    type="number"
                    value={settings.limits.dailyLimit}
                    onChange={(e) => handleChange('limits', 'dailyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max emails per day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Limit</label>
                  <input
                    type="number"
                    value={settings.limits.hourlyLimit}
                    onChange={(e) => handleChange('limits', 'hourlyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max emails per hour</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Per Minute</label>
                  <input
                    type="number"
                    value={settings.limits.rateLimitPerMinute}
                    onChange={(e) => handleChange('limits', 'rateLimitPerMinute', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max emails per minute</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-700">
                  Rate limits help prevent your domain from being flagged as spam. Adjust based on your SMTP provider's limits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Test Email */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Test Connection</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={sendTestEmail}
                disabled={testStatus === 'sending' || !testEmail}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {testStatus === 'sending' ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test Email
                  </>
                )}
              </button>

              {testStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">Test email sent successfully!</p>
                </div>
              )}

              {testStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">Failed to send test email</p>
                </div>
              )}
            </div>
          </div>

          {/* Email Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-blue-900">Email Statistics</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Sent (24h)</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.sent24h.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.sentThisMonth.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Delivery</p>
                  <p className="text-lg font-bold text-green-600">{emailStats.deliveryRate}%</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Open Rate</p>
                  <p className="text-lg font-bold text-blue-600">{emailStats.openRate}%</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Click Rate</p>
                  <p className="text-lg font-bold text-purple-600">{emailStats.clickRate}%</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Bounce</p>
                  <p className="text-lg font-bold text-orange-600">{emailStats.bounceRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Email Features</h2>

            <div className="space-y-3">
              {Object.entries(settings.settings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleChange('settings', key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
