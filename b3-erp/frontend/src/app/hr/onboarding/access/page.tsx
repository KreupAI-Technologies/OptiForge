'use client';

import { useState, useMemo, useEffect } from 'react';
import { Key, Search, Filter, X, Download, CheckCircle, Clock, AlertCircle, User, Shield, Mail, Database, Wifi, Lock, Eye } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface SystemAccess {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  email?: string;
  emailStatus: 'pending' | 'created' | 'activated';
  erpAccess?: boolean;
  erpRole?: string;
  vpnAccess?: boolean;
  wifiAccess?: boolean;
  biometricEnrolled?: boolean;
  accessCardIssued?: boolean;
  status: 'pending' | 'in_progress' | 'partial' | 'completed';
  itCoordinator: string;
  createdDate?: string;
}

export default function AccessSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [mockAccessRequests, setMockAccessRequests] = useState<SystemAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('access');
        if (!active) return;
        const mapped = records.map((r: OnboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          joiningDate: r.joiningDate || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as SystemAccess[];
        setMockAccessRequests(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockAccessRequests: SystemAccess[] = [
    {
      id: '1',
      employeeCode: 'EMP2025001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Supervisor',
      department: 'Production',
      joiningDate: '2025-11-05',
      email: 'rajesh.kumar@kmf.com',
      emailStatus: 'activated',
      erpAccess: true,
      erpRole: 'Production User',
      vpnAccess: false,
      wifiAccess: true,
      biometricEnrolled: true,
      accessCardIssued: true,
      status: 'completed',
      itCoordinator: 'Ramesh IT',
      createdDate: '2025-10-25'
    },
    {
      id: '2',
      employeeCode: 'EMP2025002',
      employeeName: 'Sneha Patel',
      designation: 'Quality Inspector',
      department: 'Quality Control',
      joiningDate: '2025-11-08',
      email: 'sneha.patel@kmf.com',
      emailStatus: 'activated',
      erpAccess: true,
      erpRole: 'QC Inspector',
      vpnAccess: false,
      wifiAccess: true,
      biometricEnrolled: true,
      accessCardIssued: false,
      status: 'partial',
      itCoordinator: 'Ramesh IT',
      createdDate: '2025-10-26'
    },
    {
      id: '3',
      employeeCode: 'EMP2025003',
      employeeName: 'Amit Singh',
      designation: 'Warehouse Executive',
      department: 'Warehouse',
      joiningDate: '2025-11-10',
      email: 'amit.singh@kmf.com',
      emailStatus: 'created',
      erpAccess: true,
      erpRole: 'Warehouse User',
      vpnAccess: false,
      wifiAccess: false,
      biometricEnrolled: false,
      accessCardIssued: false,
      status: 'in_progress',
      itCoordinator: 'Suresh IT',
      createdDate: '2025-10-28'
    },
    {
      id: '4',
      employeeCode: 'EMP2025004',
      employeeName: 'Neha Gupta',
      designation: 'HR Executive',
      department: 'HR',
      joiningDate: '2025-11-01',
      email: 'neha.gupta@kmf.com',
      emailStatus: 'activated',
      erpAccess: true,
      erpRole: 'HR User',
      vpnAccess: true,
      wifiAccess: true,
      biometricEnrolled: true,
      accessCardIssued: true,
      status: 'completed',
      itCoordinator: 'Ramesh IT',
      createdDate: '2025-10-20'
    },
    {
      id: '5',
      employeeCode: 'EMP2025005',
      employeeName: 'Vikram Rao',
      designation: 'Machine Operator',
      department: 'Production',
      joiningDate: '2025-11-12',
      emailStatus: 'pending',
      erpAccess: false,
      vpnAccess: false,
      wifiAccess: false,
      biometricEnrolled: false,
      accessCardIssued: false,
      status: 'pending',
      itCoordinator: 'Suresh IT'
    },
    {
      id: '6',
      employeeCode: 'EMP2025006',
      employeeName: 'Priya Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      joiningDate: '2025-11-15',
      email: 'priya.desai@kmf.com',
      emailStatus: 'created',
      erpAccess: true,
      erpRole: 'Finance Manager',
      vpnAccess: true,
      wifiAccess: true,
      biometricEnrolled: false,
      accessCardIssued: false,
      status: 'in_progress',
      itCoordinator: 'Ramesh IT',
      createdDate: '2025-10-30'
    }
  ];

  const filteredRequests = useMemo(() => {
    return mockAccessRequests.filter(request => {
      const matchesSearch = searchTerm === '' ||
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || request.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const stats = {
    total: mockAccessRequests.length,
    pending: mockAccessRequests.filter(r => r.status === 'pending').length,
    inProgress: mockAccessRequests.filter(r => r.status === 'in_progress').length,
    partial: mockAccessRequests.filter(r => r.status === 'partial').length,
    completed: mockAccessRequests.filter(r => r.status === 'completed').length,
    emailActivated: mockAccessRequests.filter(r => r.emailStatus === 'activated').length,
    biometricDone: mockAccessRequests.filter(r => r.biometricEnrolled).length
  };

  const getStatusColor = (status: SystemAccess['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: SystemAccess['status']) => {
    const icons = {
      'pending': Clock,
      'in_progress': Key,
      'partial': AlertCircle,
      'completed': CheckCircle
    };
    return icons[status];
  };

  const getEmailStatusColor = (status: SystemAccess['emailStatus']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-600',
      'created': 'bg-blue-100 text-blue-700',
      'activated': 'bg-green-100 text-green-700'
    };
    return colors[status];
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Details',
      sortable: true,
      render: (value: string, row: SystemAccess) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
            {row.employeeName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.employeeCode}</div>
            <div className="text-xs text-gray-600">{row.designation}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value: string, row: SystemAccess) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.itCoordinator}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value: string | undefined, row: SystemAccess) => (
        <div>
          <div className="text-sm text-gray-900 font-mono">{value || '-'}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getEmailStatusColor(row.emailStatus)}`}>
            {row.emailStatus.toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'erpAccess',
      label: 'ERP Access',
      sortable: true,
      render: (value: boolean | undefined, row: SystemAccess) => (
        <div>
          {value ? (
            <div>
              <CheckCircle className="w-5 h-5 text-green-600 inline" />
              <div className="text-xs text-gray-600 mt-1">{row.erpRole}</div>
            </div>
          ) : (
            <Clock className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'accessDetails',
      label: 'Access Details',
      sortable: false,
      render: (value: any, row: SystemAccess) => (
        <div className="flex gap-2">
          <div title={row.vpnAccess ? 'VPN Enabled' : 'VPN Not Enabled'}>
            <Shield className={`w-5 h-5 ${row.vpnAccess ? 'text-green-600' : 'text-gray-300'}`} />
          </div>
          <div title={row.wifiAccess ? 'WiFi Enabled' : 'WiFi Not Enabled'}>
            <Wifi className={`w-5 h-5 ${row.wifiAccess ? 'text-green-600' : 'text-gray-300'}`} />
          </div>
          <div title={row.biometricEnrolled ? 'Biometric Enrolled' : 'Biometric Pending'}>
            <User className={`w-5 h-5 ${row.biometricEnrolled ? 'text-green-600' : 'text-gray-300'}`} />
          </div>
          <div title={row.accessCardIssued ? 'Access Card Issued' : 'Access Card Pending'}>
            <Key className={`w-5 h-5 ${row.accessCardIssued ? 'text-green-600' : 'text-gray-300'}`} />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: SystemAccess['status']) => {
        const StatusIcon = getStatusIcon(value);
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
            <StatusIcon className="w-3 h-3" />
            {value.replace('_', ' ').toUpperCase()}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: SystemAccess) => (
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
           
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const departments = Array.from(new Set(mockAccessRequests.map(r => r.department)));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Key className="h-8 w-8 text-blue-600" />
          System Access Provisioning
        </h1>
        <p className="text-gray-600 mt-2">Manage IT system access and credentials for new employees</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Key className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
            </div>
            <Key className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-700 font-medium">Partial</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.partial}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 font-medium">Email Active</p>
              <p className="text-2xl font-bold text-purple-900">{stats.emailActivated}</p>
            </div>
            <Mail className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Biometric Done</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.biometricDone}</p>
            </div>
            <User className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, employee code, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(statusFilter !== 'all' || departmentFilter !== 'all' || searchTerm) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Status: {statusFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </span>
            )}
            {departmentFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Department: {departmentFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDepartmentFilter('all')} />
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Search: {searchTerm}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Access Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredRequests}
          columns={columns}
        />
      </div>

      {/* Access Setup Guidelines */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Access Provisioning Checklist
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            {[
              { icon: Mail, title: 'Email Account', desc: 'Create company email (firstname.lastname@kmf.com)' },
              { icon: Database, title: 'ERP Access', desc: 'Grant role-based ERP system access' },
              { icon: Shield, title: 'VPN Access', desc: 'Issue VPN credentials for remote work (if applicable)' },
              { icon: Wifi, title: 'WiFi Access', desc: 'Provide WiFi SSID and password' },
              { icon: User, title: 'Biometric Enrollment', desc: 'Register fingerprint for attendance system' },
              { icon: Key, title: 'Access Card', desc: 'Issue RFID card for facility access' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Access Setup Policy
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Timeline:</strong> All access must be provisioned 2 days before joining date</li>
            <li>• <strong>Email Format:</strong> firstname.lastname@kmf.com (lowercase only)</li>
            <li>• <strong>Default Password:</strong> Temporary password sent to personal email, must change on first login</li>
            <li>• <strong>ERP Roles:</strong> Access based on job role, requires department head approval</li>
            <li>• <strong>VPN:</strong> Only for roles requiring remote work access</li>
            <li>• <strong>Biometric:</strong> Mandatory for all employees (attendance tracking)</li>
            <li>• <strong>Access Card:</strong> Required for entry to production floor and restricted areas</li>
            <li>• <strong>Security Training:</strong> IT security briefing on Day 1</li>
            <li>• <strong>Account Deactivation:</strong> All access revoked on last working day</li>
            <li>• <strong>Password Policy:</strong> Min 8 chars, mix of letters/numbers/symbols, change every 90 days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
