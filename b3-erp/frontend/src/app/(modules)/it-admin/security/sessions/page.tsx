'use client';

import { useState } from 'react';
import { Users, Monitor, Smartphone, Clock, MapPin, XCircle, Shield, AlertTriangle, RefreshCw, Settings, Download, Trash2, Eye } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  loginTime: string;
  lastActivity: string;
  duration: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  sessionType: string;
  status: string;
  idleTime: number;
}

interface SessionSettings {
  maxSessions: number;
  sessionTimeout: number;
  idleTimeout: number;
  rememberMe: boolean;
  rememberMeDuration: number;
  concurrentSessions: boolean;
  forceSingleSession: boolean;
  sessionWarning: boolean;
  warningTime: number;
}

const SessionManagementPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const [settings, setSettings] = useState<SessionSettings>({
    maxSessions: 5,
    sessionTimeout: 480,
    idleTimeout: 30,
    rememberMe: true,
    rememberMeDuration: 30,
    concurrentSessions: true,
    forceSingleSession: false,
    sessionWarning: true,
    warningTime: 5,
  });

  const [sessions] = useState<ActiveSession[]>([
    {
      id: '1',
      userId: 'USR001',
      userName: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      department: 'IT',
      role: 'Admin',
      loginTime: '2025-10-21 09:00:00',
      lastActivity: '2025-10-21 11:45:23',
      duration: '2h 45m',
      ipAddress: '103.21.244.45',
      location: 'Mumbai, India',
      device: 'Desktop',
      browser: 'Chrome 118',
      os: 'Windows 11',
      sessionType: 'Web',
      status: 'Active',
      idleTime: 2,
    },
    {
      id: '2',
      userId: 'USR001',
      userName: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      department: 'IT',
      role: 'Admin',
      loginTime: '2025-10-21 08:30:00',
      lastActivity: '2025-10-21 09:15:00',
      duration: '3h 15m',
      ipAddress: '49.207.198.156',
      location: 'Mumbai, India',
      device: 'Mobile',
      browser: 'Safari',
      os: 'iOS 17',
      sessionType: 'Mobile App',
      status: 'Active',
      idleTime: 150,
    },
    {
      id: '3',
      userId: 'USR002',
      userName: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      department: 'HR',
      role: 'HR Manager',
      loginTime: '2025-10-21 10:15:00',
      lastActivity: '2025-10-21 11:40:12',
      duration: '1h 30m',
      ipAddress: '103.50.161.89',
      location: 'Bangalore, India',
      device: 'Laptop',
      browser: 'Firefox 119',
      os: 'Windows 10',
      sessionType: 'Web',
      status: 'Active',
      idleTime: 5,
    },
    {
      id: '4',
      userId: 'USR003',
      userName: 'Amit Patel',
      email: 'amit.patel@company.com',
      department: 'Finance',
      role: 'Finance Manager',
      loginTime: '2025-10-21 08:00:00',
      lastActivity: '2025-10-21 11:30:45',
      duration: '3h 45m',
      ipAddress: '117.198.144.73',
      location: 'Delhi, India',
      device: 'Desktop',
      browser: 'Edge 118',
      os: 'Windows 11',
      sessionType: 'Web',
      status: 'Active',
      idleTime: 15,
    },
    {
      id: '5',
      userId: 'USR004',
      userName: 'Sneha Reddy',
      email: 'sneha.reddy@company.com',
      department: 'Sales',
      role: 'Sales Executive',
      loginTime: '2025-10-21 09:30:00',
      lastActivity: '2025-10-21 10:05:00',
      duration: '2h 15m',
      ipAddress: '182.68.205.12',
      location: 'Hyderabad, India',
      device: 'Tablet',
      browser: 'Safari',
      os: 'iPadOS 17',
      sessionType: 'Mobile App',
      status: 'Idle',
      idleTime: 100,
    },
    {
      id: '6',
      userId: 'USR005',
      userName: 'Vikram Singh',
      email: 'vikram.singh@company.com',
      department: 'Operations',
      role: 'Operations Manager',
      loginTime: '2025-10-21 07:45:00',
      lastActivity: '2025-10-21 11:42:00',
      duration: '4h 0m',
      ipAddress: '157.48.123.45',
      location: 'Chennai, India',
      device: 'Desktop',
      browser: 'Chrome 118',
      os: 'macOS Sonoma',
      sessionType: 'Web',
      status: 'Active',
      idleTime: 3,
    },
    {
      id: '7',
      userId: 'USR006',
      userName: 'Anjali Desai',
      email: 'anjali.desai@company.com',
      department: 'Marketing',
      role: 'Marketing Manager',
      loginTime: '2025-10-21 10:00:00',
      lastActivity: '2025-10-21 11:35:30',
      duration: '1h 45m',
      ipAddress: '202.54.1.78',
      location: 'Pune, India',
      device: 'Laptop',
      browser: 'Chrome 118',
      os: 'Windows 11',
      sessionType: 'Web',
      status: 'Active',
      idleTime: 10,
    },
    {
      id: '8',
      userId: 'USR007',
      userName: 'Rahul Mehta',
      email: 'rahul.mehta@company.com',
      department: 'IT',
      role: 'IT Manager',
      loginTime: '2025-10-21 07:30:00',
      lastActivity: '2025-10-21 08:45:00',
      duration: '4h 15m',
      ipAddress: '115.96.200.123',
      location: 'Kolkata, India',
      device: 'Desktop',
      browser: 'Edge 118',
      os: 'Windows 10',
      sessionType: 'Web',
      status: 'Suspicious',
      idleTime: 180,
    },
  ]);

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.status === 'Active').length,
    idleSessions: sessions.filter(s => s.status === 'Idle').length,
    suspiciousSessions: sessions.filter(s => s.status === 'Suspicious').length,
    uniqueUsers: new Set(sessions.map(s => s.userId)).size,
    mobileDevices: sessions.filter(s => s.device === 'Mobile' || s.device === 'Tablet').length,
  };

  const filteredSessions = sessions.filter(session => {
    const matchesDevice = filterDevice === 'all' || session.device.toLowerCase() === filterDevice.toLowerCase();
    const matchesStatus = filterStatus === 'all' || session.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.ipAddress.includes(searchQuery);
    return matchesDevice && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspicious':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
      case 'laptop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    if (confirm('Are you sure you want to terminate this session?')) {
      alert(`Session ${sessionId} terminated successfully!`);
    }
  };

  const handleTerminateSelected = () => {
    if (selectedSessions.length === 0) {
      alert('Please select at least one session to terminate.');
      return;
    }
    if (confirm(`Are you sure you want to terminate ${selectedSessions.length} session(s)?`)) {
      alert(`${selectedSessions.length} session(s) terminated successfully!`);
      setSelectedSessions([]);
    }
  };

  const handleTerminateAllUserSessions = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to terminate all sessions for ${userName}?`)) {
      alert(`All sessions for ${userName} terminated successfully!`);
    }
  };

  const handleRefresh = () => {
    alert('Refreshing session list...');
  };

  const handleExport = () => {
    exportToCsv('active-sessions', filteredSessions as unknown as Record<string, unknown>[]);
  };

  const handleSaveSettings = () => {
    alert('Session settings saved successfully!');
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(s => s.id));
    }
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
              <p className="text-gray-600">Monitor and manage active user sessions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {selectedSessions.length > 0 && (
              <button
                onClick={handleTerminateSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Terminate Selected ({selectedSessions.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Sessions</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Idle</span>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.idleSessions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.suspiciousSessions}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Unique Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Mobile Devices</span>
            <Smartphone className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.mobileDevices}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'active'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Session Settings
            </button>
          </div>
        </div>

        {/* Active Sessions Tab */}
        {activeTab === 'active' && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Search by user, email, or IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="laptop">Laptop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="suspicious">Suspicious</option>
              </select>
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Login Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Device</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Idle Time</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedSessions.includes(session.id)}
                          onChange={() => handleSelectSession(session.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{session.userName}</div>
                          <div className="text-sm text-gray-500">{session.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm text-gray-900">{session.department}</div>
                          <div className="text-xs text-gray-500">{session.role}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{session.loginTime}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{session.duration}</td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{session.ipAddress}</code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {session.location}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {getDeviceIcon(session.device)}
                            {session.device}
                          </div>
                          <div className="text-xs text-gray-500">{session.browser}</div>
                          <div className="text-xs text-gray-500">{session.os}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${session.idleTime > 60 ? 'text-red-600 font-medium' : session.idleTime > 15 ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {session.idleTime} min
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-700 p-1"
                           
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTerminateSession(session.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                           
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTerminateAllUserSessions(session.userId, session.userName)}
                            className="text-orange-600 hover:text-orange-700 p-1"
                           
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSessions.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No active sessions found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="w-full space-y-3">
              {/* Session Limits */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Session Limits</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Concurrent Sessions per User
                    </label>
                    <input
                      type="number"
                      value={settings.maxSessions}
                      onChange={(e) => setSettings({ ...settings, maxSessions: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of simultaneous sessions allowed per user</p>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.concurrentSessions}
                      onChange={(e) => setSettings({ ...settings, concurrentSessions: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow concurrent sessions</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.forceSingleSession}
                      onChange={(e) => setSettings({ ...settings, forceSingleSession: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Force single session (terminate old sessions on new login)</span>
                  </label>
                </div>
              </div>

              {/* Timeout Settings */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Timeout Settings</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="30"
                      max="1440"
                      step="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum session duration before automatic logout</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idle Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.idleTimeout}
                      onChange={(e) => setSettings({ ...settings, idleTimeout: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="5"
                      max="120"
                      step="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Logout user after this period of inactivity</p>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.sessionWarning}
                      onChange={(e) => setSettings({ ...settings, sessionWarning: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show timeout warning</span>
                  </label>

                  {settings.sessionWarning && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-600 mb-1">Warning time before timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.warningTime}
                        onChange={(e) => setSettings({ ...settings, warningTime: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="15"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Remember Me */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Remember Me</h3>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.rememberMe}
                      onChange={(e) => setSettings({ ...settings, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable "Remember Me" feature</span>
                  </label>

                  {settings.rememberMe && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-600 mb-1">Remember Me duration (days)</label>
                      <input
                        type="number"
                        value={settings.rememberMeDuration}
                        onChange={(e) => setSettings({ ...settings, rememberMeDuration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="7"
                        max="90"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagementPage;
