'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, QrCode, CheckCircle2, XCircle, Clock, AlertTriangle, Mail, MessageSquare, Settings, Users, Download, X, BarChart3, Eye, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface TwoFactorSettings {
  enabled: boolean;
  mandatory: boolean;
  methods: {
    app: {
      enabled: boolean;
      name: string;
      apps: string[];
    };
    sms: {
      enabled: boolean;
      provider: string;
    };
    email: {
      enabled: boolean;
    };
    backup: {
      enabled: boolean;
      codesCount: number;
    };
  };
  enforcement: {
    gracePeriod: number;
    reminders: boolean;
    byRole: boolean;
    requiredRoles: string[];
  };
  recovery: {
    allowBackupCodes: boolean;
    allowAdminReset: boolean;
    requireApproval: boolean;
  };
}

interface UserTwoFactorStatus {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  status: string;
  method: string;
  enrolledDate: string;
  lastUsed: string;
  backupCodes: number;
  deviceCount: number;
  failedAttempts: number;
}

interface TwoFactorStats {
  totalUsers: number;
  enrolled: number;
  pending: number;
  notEnrolled: number;
  mandatoryUsers: number;
  byMethod: {
    app: number;
    sms: number;
    email: number;
  };
}

const TwoFactorAuthPage = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [showQRCode, setShowQRCode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserTwoFactorStatus | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [settings, setSettings] = useState<TwoFactorSettings>({
    enabled: true,
    mandatory: false,
    methods: {
      app: {
        enabled: true,
        name: 'Authenticator App',
        apps: ['Google Authenticator', 'Microsoft Authenticator', 'Authy'],
      },
      sms: {
        enabled: true,
        provider: 'Twilio',
      },
      email: {
        enabled: true,
      },
      backup: {
        enabled: true,
        codesCount: 10,
      },
    },
    enforcement: {
      gracePeriod: 30,
      reminders: true,
      byRole: true,
      requiredRoles: ['Admin', 'Finance Manager', 'IT Manager'],
    },
    recovery: {
      allowBackupCodes: true,
      allowAdminReset: true,
      requireApproval: true,
    },
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dto = await ItAdminService.getPasswordPolicy();
        if (!mounted || !dto) return;
        setSettings((prev) => ({
          ...prev,
          mandatory: dto.mfaRequired ?? prev.mandatory,
        }));
      } catch {
        // keep defaults if policy not found
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [userStatuses] = useState<UserTwoFactorStatus[]>([
    {
      id: '1',
      userId: 'USR001',
      userName: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      department: 'IT',
      role: 'Admin',
      status: 'Enrolled',
      method: 'Authenticator App',
      enrolledDate: '2025-09-01',
      lastUsed: '2025-10-21 09:15',
      backupCodes: 8,
      deviceCount: 2,
      failedAttempts: 0,
    },
    {
      id: '2',
      userId: 'USR002',
      userName: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      department: 'HR',
      role: 'HR Manager',
      status: 'Enrolled',
      method: 'SMS',
      enrolledDate: '2025-09-15',
      lastUsed: '2025-10-21 08:30',
      backupCodes: 10,
      deviceCount: 1,
      failedAttempts: 0,
    },
    {
      id: '3',
      userId: 'USR003',
      userName: 'Amit Patel',
      email: 'amit.patel@company.com',
      department: 'Finance',
      role: 'Finance Manager',
      status: 'Pending',
      method: 'Not Set',
      enrolledDate: '-',
      lastUsed: '-',
      backupCodes: 0,
      deviceCount: 0,
      failedAttempts: 0,
    },
    {
      id: '4',
      userId: 'USR004',
      userName: 'Sneha Reddy',
      email: 'sneha.reddy@company.com',
      department: 'Sales',
      role: 'Sales Executive',
      status: 'Not Enrolled',
      method: 'Not Set',
      enrolledDate: '-',
      lastUsed: '-',
      backupCodes: 0,
      deviceCount: 0,
      failedAttempts: 0,
    },
    {
      id: '5',
      userId: 'USR005',
      userName: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      department: 'Operations',
      role: 'Operations Manager',
      status: 'Enrolled',
      method: 'Email',
      enrolledDate: '2025-08-20',
      lastUsed: '2025-10-20 16:45',
      backupCodes: 7,
      deviceCount: 1,
      failedAttempts: 1,
    },
    {
      id: '6',
      userId: 'USR006',
      userName: 'Anjali Desai',
      email: 'anjali.desai@company.com',
      department: 'Marketing',
      role: 'Marketing Manager',
      status: 'Enrolled',
      method: 'Authenticator App',
      enrolledDate: '2025-09-10',
      lastUsed: '2025-10-21 10:00',
      backupCodes: 9,
      deviceCount: 2,
      failedAttempts: 0,
    },
    {
      id: '7',
      userId: 'USR007',
      userName: 'Rahul Mehta',
      email: 'rahul.mehta@company.com',
      department: 'IT',
      role: 'IT Manager',
      status: 'Enrolled',
      method: 'Authenticator App',
      enrolledDate: '2025-08-01',
      lastUsed: '2025-10-21 07:30',
      backupCodes: 10,
      deviceCount: 3,
      failedAttempts: 0,
    },
    {
      id: '8',
      userId: 'USR008',
      userName: 'Deepika Rao',
      email: 'deepika.rao@company.com',
      department: 'Production',
      role: 'Production Supervisor',
      status: 'Pending',
      method: 'Not Set',
      enrolledDate: '-',
      lastUsed: '-',
      backupCodes: 0,
      deviceCount: 0,
      failedAttempts: 0,
    },
  ]);

  const stats: TwoFactorStats = {
    totalUsers: userStatuses.length,
    enrolled: userStatuses.filter(u => u.status === 'Enrolled').length,
    pending: userStatuses.filter(u => u.status === 'Pending').length,
    notEnrolled: userStatuses.filter(u => u.status === 'Not Enrolled').length,
    mandatoryUsers: userStatuses.filter(u => settings.enforcement.requiredRoles.includes(u.role)).length,
    byMethod: {
      app: userStatuses.filter(u => u.method === 'Authenticator App').length,
      sms: userStatuses.filter(u => u.method === 'SMS').length,
      email: userStatuses.filter(u => u.method === 'Email').length,
    },
  };

  const enrollmentRate = Math.round((stats.enrolled / stats.totalUsers) * 100);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not enrolled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'authenticator app':
        return <Smartphone className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const handleSaveSettings = async () => {
    try {
      await ItAdminService.savePasswordPolicy({ mfaRequired: settings.mandatory });
      setToast({ message: '2FA settings saved successfully!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save 2FA settings. Please try again.', type: 'error' });
    }
  };

  const handleSendReminder = (userId: string) => {
    const user = userStatuses.find(u => u.userId === userId);
    setToast({ message: `Enrollment reminder sent to ${user?.userName}`, type: 'info' });
  };

  const handleResetTwoFactor = (userId: string) => {
    const user = userStatuses.find(u => u.userId === userId);
    setToast({ message: `2FA reset for ${user?.userName}. They will need to re-enroll.`, type: 'success' });
  };

  const handleGenerateBackupCodes = (userId: string) => {
    const user = userStatuses.find(u => u.userId === userId);
    setToast({ message: `New backup codes generated for ${user?.userName}`, type: 'success' });
  };

  const handleExportReport = () => {
    exportToCsv('2fa-enrollment', userStatuses as unknown as Record<string, unknown>[]);
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setActiveTab('users');
        setToast({ message: 'Showing all users', type: 'info' });
        break;
      case 'enrolled':
        setActiveTab('users');
        setToast({ message: 'Showing enrolled users', type: 'success' });
        break;
      case 'pending':
        setActiveTab('users');
        setToast({ message: 'Showing pending users', type: 'info' });
        break;
      case 'not-enrolled':
        setActiveTab('users');
        setToast({ message: 'Showing not enrolled users', type: 'error' });
        break;
      case 'analytics':
        setShowAnalyticsModal(true);
        break;
    }
  };

  const handleViewUserDetails = (user: UserTwoFactorStatus) => {
    setSelectedUser(user);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        } rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2">
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
              <p className="text-gray-600">Configure and manage 2FA settings for enhanced security</p>
            </div>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <button
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          <p className="text-xs text-blue-600 mt-1">Click to view all</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('enrolled')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Enrolled</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.enrolled}</div>
          <p className="text-xs text-green-600 mt-1">Click to filter</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('pending')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-yellow-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending</span>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-xs text-yellow-600 mt-1">Click to filter</p>
        </button>

        <button
          onClick={() => handleStatsCardClick('not-enrolled')}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3 hover:border-red-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Not Enrolled</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.notEnrolled}</div>
          <p className="text-xs text-red-600 mt-1">Click to filter</p>
        </button>

        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Mandatory Users</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.mandatoryUsers}</div>
        </div>

        <button
          onClick={() => handleStatsCardClick('analytics')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border-2 border-purple-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-600 font-medium">Analytics</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-semibold text-purple-900">{enrollmentRate}% Rate</div>
          <p className="text-xs text-purple-600 mt-1">View insights</p>
        </button>
      </div>

      {/* Enrollment Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Enrollment Progress</h3>
          <span className="text-sm text-gray-600">{stats.enrolled} of {stats.totalUsers} users enrolled</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${enrollmentRate}%` }}
          />
        </div>

        {/* Methods Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Authenticator App</div>
                <div className="text-2xl font-bold text-gray-900">{stats.byMethod.app}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Most secure method</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">SMS</div>
                <div className="text-2xl font-bold text-gray-900">{stats.byMethod.sms}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Phone number required</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-2xl font-bold text-gray-900">{stats.byMethod.email}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Least secure method</div>
          </div>
        </div>
      </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
          
          {/* Tabs */}
          <div className="flex-none border-b border-gray-200">
            <div className="flex gap-2 px-6">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                2FA Settings
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                User Status
              </button>
              <button
                onClick={() => setActiveTab('setup')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'setup'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Setup Guide
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-6">
            <div className="space-y-3">
              {/* Global Settings */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Global Settings</h3>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.mandatory}
                      onChange={(e) => setSettings({ ...settings, mandatory: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={!settings.enabled}
                    />
                    <span className="text-sm font-medium text-gray-700">Make 2FA mandatory for all users</span>
                  </label>
                </div>
              </div>

              {/* Authentication Methods */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Authentication Methods</h3>
                </div>

                <div className="space-y-2">
                  {/* Authenticator App */}
                  <div className="bg-white rounded-lg p-3">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={settings.methods.app.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          methods: { ...settings.methods, app: { ...settings.methods.app, enabled: e.target.checked } }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Authenticator App (Recommended)</span>
                    </label>
                    {settings.methods.app.enabled && (
                      <div className="ml-6 text-sm text-gray-600">
                        <p className="mb-2">Supported apps:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {settings.methods.app.apps.map((app, index) => (
                            <li key={index}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* SMS */}
                  <div className="bg-white rounded-lg p-3">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={settings.methods.sms.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          methods: { ...settings.methods, sms: { ...settings.methods.sms, enabled: e.target.checked } }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">SMS</span>
                    </label>
                    {settings.methods.sms.enabled && (
                      <div className="ml-6">
                        <label className="block text-sm text-gray-600 mb-1">SMS Provider</label>
                        <select
                          value={settings.methods.sms.provider}
                          onChange={(e) => setSettings({
                            ...settings,
                            methods: { ...settings.methods, sms: { ...settings.methods.sms, provider: e.target.value } }
                          })}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option>Twilio</option>
                          <option>AWS SNS</option>
                          <option>Nexmo</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-lg p-3">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={settings.methods.email.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          methods: { ...settings.methods, email: { ...settings.methods.email, enabled: e.target.checked } }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Email (Least Secure)</span>
                    </label>
                  </div>

                  {/* Backup Codes */}
                  <div className="bg-white rounded-lg p-3">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={settings.methods.backup.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          methods: { ...settings.methods, backup: { ...settings.methods.backup, enabled: e.target.checked } }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Key className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Backup Codes</span>
                    </label>
                    {settings.methods.backup.enabled && (
                      <div className="ml-6">
                        <label className="block text-sm text-gray-600 mb-1">Number of codes to generate</label>
                        <input
                          type="number"
                          value={settings.methods.backup.codesCount}
                          onChange={(e) => setSettings({
                            ...settings,
                            methods: { ...settings.methods, backup: { ...settings.methods.backup, codesCount: parseInt(e.target.value) } }
                          })}
                          className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="5"
                          max="20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enforcement Policy */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Enforcement Policy</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grace Period (days)
                    </label>
                    <input
                      type="number"
                      value={settings.enforcement.gracePeriod}
                      onChange={(e) => setSettings({
                        ...settings,
                        enforcement: { ...settings.enforcement, gracePeriod: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="90"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of days users have to enroll after activation</p>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enforcement.reminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        enforcement: { ...settings.enforcement, reminders: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Send enrollment reminders</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enforcement.byRole}
                      onChange={(e) => setSettings({
                        ...settings,
                        enforcement: { ...settings.enforcement, byRole: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enforce by role</span>
                  </label>

                  {settings.enforcement.byRole && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-600 mb-2">Required Roles</label>
                      <div className="space-y-2">
                        {['Admin', 'Finance Manager', 'IT Manager', 'HR Manager'].map((role) => (
                          <label key={role} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={settings.enforcement.requiredRoles.includes(role)}
                              onChange={(e) => {
                                const roles = e.target.checked
                                  ? [...settings.enforcement.requiredRoles, role]
                                  : settings.enforcement.requiredRoles.filter(r => r !== role);
                                setSettings({
                                  ...settings,
                                  enforcement: { ...settings.enforcement, requiredRoles: roles }
                                });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recovery Options */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Recovery Options</h3>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.recovery.allowBackupCodes}
                      onChange={(e) => setSettings({
                        ...settings,
                        recovery: { ...settings.recovery, allowBackupCodes: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow backup code recovery</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.recovery.allowAdminReset}
                      onChange={(e) => setSettings({
                        ...settings,
                        recovery: { ...settings.recovery, allowAdminReset: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow admin reset</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.recovery.requireApproval}
                      onChange={(e) => setSettings({
                        ...settings,
                        recovery: { ...settings.recovery, requireApproval: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={!settings.recovery.allowAdminReset}
                    />
                    <span className="text-sm font-medium text-gray-700">Require approval for admin reset</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Enrolled</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Last Used</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Backup Codes</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Devices</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userStatuses.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleViewUserDetails(user)}
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${settings.enforcement.requiredRoles.includes(user.role) ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                          {user.role}
                          {settings.enforcement.requiredRoles.includes(user.role) && ' *'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getMethodIcon(user.method)}
                          {user.method}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.enrolledDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.lastUsed}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.backupCodes > 0 ? user.backupCodes : '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.deviceCount > 0 ? user.deviceCount : '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewUserDetails(user);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.status === 'Pending' || user.status === 'Not Enrolled' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendReminder(user.userId);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-100 rounded transition-colors"
                            >
                              Send Reminder
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateBackupCodes(user.userId);
                                }}
                                className="text-sm text-green-600 hover:text-green-700 font-medium px-2 py-1 hover:bg-green-100 rounded transition-colors"
                              >
                                Backup Codes
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetTwoFactor(user.userId);
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-100 rounded transition-colors"
                              >
                                Reset
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              * Indicates mandatory 2FA for this role
            </div>
          </div>
        )}

        {/* Setup Guide Tab */}
        {activeTab === 'setup' && (
          <div className="p-6">
            <div className="w-full space-y-3">
              {/* QR Code Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <QrCode className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Setup Authenticator App</h3>
                </div>
                
                <ol className="space-y-3 text-sm text-blue-800 mb-2">
                  <li className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>Download an authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>Open the app and select "Add Account" or "Scan QR Code"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>Scan the QR code below or enter the setup key manually</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>Enter the 6-digit code from your app to verify</span>
                  </li>
                </ol>

                <div className="flex items-center justify-center mb-2">
                  {showQRCode ? (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-400" />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Setup Key:</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">ABCD EFGH IJKL MNOP</code>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowQRCode(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Show QR Code
                    </button>
                  )}
                </div>
              </div>

              {/* SMS Setup */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-900">Setup SMS Authentication</h3>
                </div>
                
                <ol className="space-y-3 text-sm text-green-800">
                  <li className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>Go to your profile settings</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>Add or verify your mobile phone number</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>Select SMS as your 2FA method</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>Enter the verification code sent to your phone</span>
                  </li>
                </ol>
              </div>

              {/* Email Setup */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Setup Email Authentication</h3>
                </div>
                
                <ol className="space-y-3 text-sm text-purple-800">
                  <li className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>Ensure your email address is verified</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>Go to your profile settings</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>Select Email as your 2FA method</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>You will receive a code via email during each login</span>
                  </li>
                </ol>
              </div>

              {/* Backup Codes */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Backup Codes</h3>
                </div>
                
                <p className="text-sm text-orange-800 mb-3">
                  Backup codes allow you to access your account if you lose access to your 2FA device. 
                  Each code can be used only once.
                </p>
                
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Generate backup codes after setting up 2FA</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Store them in a safe place (not on your device)</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Each code can only be used once</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Generate new codes if you run out</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
