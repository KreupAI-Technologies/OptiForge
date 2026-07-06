'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Clock, AlertTriangle, CheckCircle2, Settings, Save, RotateCcw, Eye, EyeOff, Info } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface PasswordPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventCommonPasswords: boolean;
    preventUserInfo: boolean;
  };
  expiry: {
    enabled: boolean;
    days: number;
    warningDays: number;
  };
  history: {
    enabled: boolean;
    remember: number;
  };
  lockout: {
    enabled: boolean;
    attempts: number;
    duration: number;
  };
  complexity: {
    level: string;
    score: number;
  };
}

interface PasswordStrength {
  password: string;
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

interface UserPasswordStatus {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  lastChanged: string;
  daysOld: number;
  status: string;
  strength: string;
  expiresIn: number;
  failedAttempts: number;
  locked: boolean;
}

const PasswordPolicyPage = () => {
  const [activeTab, setActiveTab] = useState('policy');
  const [showTestPassword, setShowTestPassword] = useState(false);
  const [testPassword, setTestPassword] = useState('');

  const [policy, setPolicy] = useState<PasswordPolicy>({
    id: 'policy-001',
    name: 'Corporate Password Policy',
    description: 'Standard password policy for all employees',
    enabled: true,
    rules: {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventUserInfo: true,
    },
    expiry: {
      enabled: true,
      days: 90,
      warningDays: 14,
    },
    history: {
      enabled: true,
      remember: 5,
    },
    lockout: {
      enabled: true,
      attempts: 5,
      duration: 30,
    },
    complexity: {
      level: 'High',
      score: 4,
    },
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dto = await ItAdminService.getPasswordPolicy();
        if (!mounted || !dto) return;
        setPolicy((prev) => ({
          ...prev,
          rules: {
            ...prev.rules,
            minLength: dto.minLength ?? prev.rules.minLength,
            maxLength: dto.maxLength ?? prev.rules.maxLength,
            requireUppercase: dto.requireUppercase ?? prev.rules.requireUppercase,
            requireLowercase: dto.requireLowercase ?? prev.rules.requireLowercase,
            requireNumbers: dto.requireNumbers ?? prev.rules.requireNumbers,
            requireSpecialChars: dto.requireSpecialChars ?? prev.rules.requireSpecialChars,
          },
          expiry: {
            ...prev.expiry,
            days: dto.expiryDays ?? prev.expiry.days,
          },
          history: {
            ...prev.history,
            remember: dto.historyCount ?? prev.history.remember,
          },
          lockout: {
            ...prev.lockout,
            attempts: dto.lockoutThreshold ?? prev.lockout.attempts,
            duration: dto.lockoutDurationMinutes ?? prev.lockout.duration,
          },
        }));
      } catch {
        // keep defaults if policy not found
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [userStatuses] = useState<UserPasswordStatus[]>([
    {
      id: '1',
      userId: 'USR001',
      userName: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      department: 'IT',
      lastChanged: '2025-09-15',
      daysOld: 36,
      status: 'Active',
      strength: 'Strong',
      expiresIn: 54,
      failedAttempts: 0,
      locked: false,
    },
    {
      id: '2',
      userId: 'USR002',
      userName: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      department: 'HR',
      lastChanged: '2025-08-10',
      daysOld: 72,
      status: 'Expiring Soon',
      strength: 'Strong',
      expiresIn: 18,
      failedAttempts: 0,
      locked: false,
    },
    {
      id: '3',
      userId: 'USR003',
      userName: 'Amit Patel',
      email: 'amit.patel@company.com',
      department: 'Finance',
      lastChanged: '2025-07-01',
      daysOld: 112,
      status: 'Expired',
      strength: 'Medium',
      expiresIn: -22,
      failedAttempts: 2,
      locked: false,
    },
    {
      id: '4',
      userId: 'USR004',
      userName: 'Sneha Reddy',
      email: 'sneha.reddy@company.com',
      department: 'Sales',
      lastChanged: '2025-09-28',
      daysOld: 23,
      status: 'Active',
      strength: 'Weak',
      expiresIn: 67,
      failedAttempts: 0,
      locked: false,
    },
    {
      id: '5',
      userId: 'USR005',
      userName: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      department: 'Operations',
      lastChanged: '2025-06-15',
      daysOld: 128,
      status: 'Locked',
      strength: 'Strong',
      expiresIn: -38,
      failedAttempts: 5,
      locked: true,
    },
    {
      id: '6',
      userId: 'USR006',
      userName: 'Anjali Desai',
      email: 'anjali.desai@company.com',
      department: 'Marketing',
      lastChanged: '2025-09-01',
      daysOld: 50,
      status: 'Active',
      strength: 'Strong',
      expiresIn: 40,
      failedAttempts: 1,
      locked: false,
    },
    {
      id: '7',
      userId: 'USR007',
      userName: 'Rahul Mehta',
      email: 'rahul.mehta@company.com',
      department: 'IT',
      lastChanged: '2025-08-20',
      daysOld: 62,
      status: 'Active',
      strength: 'Medium',
      expiresIn: 28,
      failedAttempts: 0,
      locked: false,
    },
    {
      id: '8',
      userId: 'USR008',
      userName: 'Deepika Rao',
      email: 'deepika.rao@company.com',
      department: 'Production',
      lastChanged: '2025-07-25',
      daysOld: 88,
      status: 'Expiring Soon',
      strength: 'Weak',
      expiresIn: 2,
      failedAttempts: 3,
      locked: false,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'locked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'strong':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'weak':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= policy.rules.minLength) {
      score += 1;
    } else {
      feedback.push(`Password must be at least ${policy.rules.minLength} characters long`);
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else if (policy.rules.requireUppercase) {
      feedback.push('Password must contain at least one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else if (policy.rules.requireLowercase) {
      feedback.push('Password must contain at least one lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else if (policy.rules.requireNumbers) {
      feedback.push('Password must contain at least one number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else if (policy.rules.requireSpecialChars) {
      feedback.push('Password must contain at least one special character');
    }

    let label = '';
    let color = '';

    if (score <= 1) {
      label = 'Very Weak';
      color = 'bg-red-500';
    } else if (score === 2) {
      label = 'Weak';
      color = 'bg-orange-500';
    } else if (score === 3) {
      label = 'Medium';
      color = 'bg-yellow-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-green-500';
    } else {
      label = 'Very Strong';
      color = 'bg-green-600';
    }

    return { password, score, feedback, color, label };
  };

  const passwordStrength = calculatePasswordStrength(testPassword);

  const handleSavePolicy = async () => {
    try {
      await ItAdminService.savePasswordPolicy({
        minLength: policy.rules.minLength,
        maxLength: policy.rules.maxLength,
        requireUppercase: policy.rules.requireUppercase,
        requireLowercase: policy.rules.requireLowercase,
        requireNumbers: policy.rules.requireNumbers,
        requireSpecialChars: policy.rules.requireSpecialChars,
        expiryDays: policy.expiry.days,
        historyCount: policy.history.remember,
        lockoutThreshold: policy.lockout.attempts,
        lockoutDurationMinutes: policy.lockout.duration,
      });
      alert('Password policy saved successfully!');
    } catch {
      alert('Failed to save password policy. Please try again.');
    }
  };

  const handleResetPolicy = () => {
    if (confirm('Are you sure you want to reset the policy to default values?')) {
      // Reset logic here
    }
  };

  const handleUnlockUser = (userId: string) => {
    alert(`User ${userId} unlocked successfully!`);
  };

  const handleForcePasswordChange = (userId: string) => {
    alert(`Force password change initiated for user ${userId}`);
  };

  const stats = {
    totalUsers: userStatuses.length,
    activePasswords: userStatuses.filter(u => u.status === 'Active').length,
    expiringSoon: userStatuses.filter(u => u.status === 'Expiring Soon').length,
    expired: userStatuses.filter(u => u.status === 'Expired').length,
    locked: userStatuses.filter(u => u.locked).length,
    weakPasswords: userStatuses.filter(u => u.strength === 'Weak').length,
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Password Policy</h1>
            <p className="text-gray-600">Configure password requirements and manage user password security</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Users</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.activePasswords}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Expiring Soon</span>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Expired</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Locked</span>
            <Lock className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-600">{stats.locked}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Weak Passwords</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.weakPasswords}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab('policy')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'policy'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Policy Configuration
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              User Password Status
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'test'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Password Tester
            </button>
          </div>
        </div>

        {/* Policy Configuration Tab */}
        {activeTab === 'policy' && (
          <div className="p-6">
            <div className="space-y-3">
              {/* Basic Settings */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Basic Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Name
                    </label>
                    <input
                      type="text"
                      value={policy.name}
                      onChange={(e) => setPolicy({ ...policy, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={policy.description}
                      onChange={(e) => setPolicy({ ...policy, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.enabled}
                      onChange={(e) => setPolicy({ ...policy, enabled: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable this policy</span>
                  </label>
                </div>
              </div>

              {/* Password Rules */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Password Rules</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Length
                    </label>
                    <input
                      type="number"
                      value={policy.rules.minLength}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, minLength: parseInt(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="8"
                      max="128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Length
                    </label>
                    <input
                      type="number"
                      value={policy.rules.maxLength}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, maxLength: parseInt(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="8"
                      max="256"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.rules.requireUppercase}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, requireUppercase: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require uppercase letters (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.rules.requireLowercase}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, requireLowercase: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require lowercase letters (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.rules.requireNumbers}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, requireNumbers: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require numbers (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.rules.requireSpecialChars}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, requireSpecialChars: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require special characters (!@#$%^&*)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.rules.preventCommonPasswords}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, preventCommonPasswords: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Prevent common passwords</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.rules.preventUserInfo}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        rules: { ...policy.rules, preventUserInfo: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Prevent use of user information (name, email, etc.)</span>
                  </label>
                </div>
              </div>

              {/* Password Expiry */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Password Expiry</h3>
                </div>

                <div className="mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.expiry.enabled}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        expiry: { ...policy.expiry, enabled: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable password expiry</span>
                  </label>
                </div>

                {policy.expiry.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Period (days)
                      </label>
                      <input
                        type="number"
                        value={policy.expiry.days}
                        onChange={(e) => setPolicy({ 
                          ...policy, 
                          expiry: { ...policy.expiry, days: parseInt(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="30"
                        max="365"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warning Period (days before expiry)
                      </label>
                      <input
                        type="number"
                        value={policy.expiry.warningDays}
                        onChange={(e) => setPolicy({ 
                          ...policy, 
                          expiry: { ...policy.expiry, warningDays: parseInt(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password History */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Password History</h3>
                </div>

                <div className="mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.history.enabled}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        history: { ...policy.history, enabled: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Prevent password reuse</span>
                  </label>
                </div>

                {policy.history.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remember last N passwords
                    </label>
                    <input
                      type="number"
                      value={policy.history.remember}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        history: { ...policy.history, remember: parseInt(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max="24"
                    />
                  </div>
                )}
              </div>

              {/* Account Lockout */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Account Lockout</h3>
                </div>

                <div className="mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={policy.lockout.enabled}
                      onChange={(e) => setPolicy({ 
                        ...policy, 
                        lockout: { ...policy.lockout, enabled: e.target.checked } 
                      })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable account lockout</span>
                  </label>
                </div>

                {policy.lockout.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Failed Attempts Threshold
                      </label>
                      <input
                        type="number"
                        value={policy.lockout.attempts}
                        onChange={(e) => setPolicy({ 
                          ...policy, 
                          lockout: { ...policy.lockout, attempts: parseInt(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="3"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={policy.lockout.duration}
                        onChange={(e) => setPolicy({ 
                          ...policy, 
                          lockout: { ...policy.lockout, duration: parseInt(e.target.value) } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="5"
                        max="120"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSavePolicy}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Policy
                </button>
                <button
                  onClick={handleResetPolicy}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Password Status Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Last Changed</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Age (days)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Strength</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Expires In</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Failed Attempts</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userStatuses.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.lastChanged}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.daysOld}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${getStrengthColor(user.strength)}`}>
                          {user.strength}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${user.expiresIn < 0 ? 'text-red-600' : user.expiresIn <= 14 ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {user.expiresIn < 0 ? `${Math.abs(user.expiresIn)} days ago` : `${user.expiresIn} days`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${user.failedAttempts >= 3 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {user.failedAttempts}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.locked ? (
                            <button
                              onClick={() => handleUnlockUser(user.userId)}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Unlock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleForcePasswordChange(user.userId)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Force Change
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Password Tester Tab */}
        {activeTab === 'test' && (
          <div className="p-6">
            <div className="max-w-2xl">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Password Tester</h4>
                    <p className="text-sm text-blue-700">
                      Test passwords against your current password policy to see if they meet the requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Password
                  </label>
                  <div className="relative">
                    <input
                      type={showTestPassword ? 'text' : 'password'}
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Enter password to test..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowTestPassword(!showTestPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showTestPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {testPassword && (
                  <>
                    {/* Strength Meter */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Password Strength</span>
                        <span className="text-sm font-medium text-gray-900">{passwordStrength.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Feedback */}
                    {passwordStrength.feedback.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="font-semibold text-yellow-900 mb-2">Issues Found:</h4>
                        <ul className="space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                              <span className="text-yellow-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {passwordStrength.feedback.length === 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">
                            Password meets all policy requirements!
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordPolicyPage;
