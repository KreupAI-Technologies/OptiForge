'use client';

import { useState, useMemo, useEffect } from 'react';
import { Gift, Search, Filter, X, Download, CheckCircle, Clock, AlertCircle, Package, Briefcase, BookOpen, Shirt, Key, Phone, Eye, Users, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface WelcomeKit {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  totalItems: number;
  issuedItems: number;
  completionPercentage: number;
  status: 'pending' | 'in_progress' | 'issued' | 'returned_partial';
  issueDate?: string;
  issuedBy?: string;
  acknowledgedDate?: string;
}

interface KitItem {
  id: string;
  itemName: string;
  category: 'stationery' | 'clothing' | 'tech' | 'documents' | 'safety' | 'misc';
  description: string;
  mandatory: boolean;
  quantity: number;
  icon: any;
}

export default function WelcomeKitPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const kitItems: KitItem[] = [
    { id: '1', itemName: 'Employee Handbook', category: 'documents', description: 'Company policies and procedures guide', mandatory: true, quantity: 1, icon: BookOpen },
    { id: '2', itemName: 'ID Card', category: 'documents', description: 'Employee identification card with photo', mandatory: true, quantity: 1, icon: Key },
    { id: '3', itemName: 'Company T-Shirt', category: 'clothing', description: 'Branded company t-shirt (2 pieces)', mandatory: true, quantity: 2, icon: Shirt },
    { id: '4', itemName: 'Notepad & Pen', category: 'stationery', description: 'Company branded stationery', mandatory: true, quantity: 1, icon: BookOpen },
    { id: '5', itemName: 'Safety Shoes', category: 'safety', description: 'Steel toe safety shoes (for production roles)', mandatory: false, quantity: 1, icon: AlertCircle },
    { id: '6', itemName: 'Safety Helmet', category: 'safety', description: 'Hard hat for production floor', mandatory: false, quantity: 1, icon: AlertCircle },
    { id: '7', itemName: 'Laptop', category: 'tech', description: 'Company laptop (for office roles)', mandatory: false, quantity: 1, icon: Package },
    { id: '8', itemName: 'Mobile Phone', category: 'tech', description: 'Company mobile phone (for specific roles)', mandatory: false, quantity: 1, icon: Phone },
    { id: '9', itemName: 'Water Bottle', category: 'misc', description: 'Reusable company branded water bottle', mandatory: true, quantity: 1, icon: Gift },
    { id: '10', itemName: 'Tiffin Box', category: 'misc', description: 'Lunch box for canteen use', mandatory: true, quantity: 1, icon: Gift },
    { id: '11', itemName: 'Visiting Cards', category: 'stationery', description: 'Business cards (for customer-facing roles)', mandatory: false, quantity: 100, icon: Briefcase },
    { id: '12', itemName: 'Bag/Backpack', category: 'misc', description: 'Company branded laptop bag', mandatory: false, quantity: 1, icon: Briefcase }
  ];

  const [mockKits, setMockKits] = useState<WelcomeKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('welcome-kit');
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
          ...(r.items ? { kitItems: r.items } : {}),
        })) as WelcomeKit[];
        setMockKits(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockKits: WelcomeKit[] = [
    {
      id: '1',
      employeeCode: 'EMP2025001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Supervisor',
      department: 'Production',
      joiningDate: '2025-11-05',
      totalItems: 8,
      issuedItems: 8,
      completionPercentage: 100,
      status: 'issued',
      issueDate: '2025-11-05',
      issuedBy: 'Admin Team',
      acknowledgedDate: '2025-11-05'
    },
    {
      id: '2',
      employeeCode: 'EMP2025002',
      employeeName: 'Sneha Patel',
      designation: 'Quality Inspector',
      department: 'Quality Control',
      joiningDate: '2025-11-08',
      totalItems: 7,
      issuedItems: 7,
      completionPercentage: 100,
      status: 'issued',
      issueDate: '2025-11-08',
      issuedBy: 'Admin Team',
      acknowledgedDate: '2025-11-08'
    },
    {
      id: '3',
      employeeCode: 'EMP2025003',
      employeeName: 'Amit Singh',
      designation: 'Warehouse Executive',
      department: 'Warehouse',
      joiningDate: '2025-11-10',
      totalItems: 6,
      issuedItems: 4,
      completionPercentage: 67,
      status: 'in_progress',
      issueDate: '2025-11-09',
      issuedBy: 'Admin Team'
    },
    {
      id: '4',
      employeeCode: 'EMP2025004',
      employeeName: 'Neha Gupta',
      designation: 'HR Executive',
      department: 'HR',
      joiningDate: '2025-11-01',
      totalItems: 9,
      issuedItems: 9,
      completionPercentage: 100,
      status: 'issued',
      issueDate: '2025-11-01',
      issuedBy: 'Admin Team',
      acknowledgedDate: '2025-11-01'
    },
    {
      id: '5',
      employeeCode: 'EMP2025005',
      employeeName: 'Vikram Rao',
      designation: 'Machine Operator',
      department: 'Production',
      joiningDate: '2025-11-12',
      totalItems: 8,
      issuedItems: 0,
      completionPercentage: 0,
      status: 'pending',
      issuedBy: 'Admin Team'
    },
    {
      id: '6',
      employeeCode: 'EMP2025006',
      employeeName: 'Priya Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      joiningDate: '2025-11-15',
      totalItems: 10,
      issuedItems: 0,
      completionPercentage: 0,
      status: 'pending',
      issuedBy: 'Admin Team'
    }
  ];

  const filteredKits = useMemo(() => {
    return mockKits.filter(kit => {
      const matchesSearch = searchTerm === '' ||
        kit.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || kit.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || kit.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const stats = {
    total: mockKits.length,
    pending: mockKits.filter(k => k.status === 'pending').length,
    inProgress: mockKits.filter(k => k.status === 'in_progress').length,
    issued: mockKits.filter(k => k.status === 'issued').length,
    avgCompletion: Math.round(mockKits.reduce((sum, k) => sum + k.completionPercentage, 0) / mockKits.length),
    mandatoryItems: kitItems.filter(i => i.mandatory).length,
    totalKitItems: kitItems.length
  };

  const getStatusColor = (status: WelcomeKit['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'issued': 'bg-green-100 text-green-800',
      'returned_partial': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: WelcomeKit['status']) => {
    const icons = {
      'pending': Clock,
      'in_progress': Package,
      'issued': CheckCircle,
      'returned_partial': AlertCircle
    };
    return icons[status];
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryColor = (category: KitItem['category']) => {
    const colors = {
      'stationery': 'bg-blue-100 text-blue-700',
      'clothing': 'bg-purple-100 text-purple-700',
      'tech': 'bg-indigo-100 text-indigo-700',
      'documents': 'bg-green-100 text-green-700',
      'safety': 'bg-red-100 text-red-700',
      'misc': 'bg-gray-100 text-gray-700'
    };
    return colors[category];
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Details',
      sortable: true,
      render: (value: string, row: WelcomeKit) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
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
      render: (value: string, row: WelcomeKit) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">Issued by: {row.issuedBy}</div>
        </div>
      )
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-blue-500" />
          {new Date(value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
    {
      key: 'issuedItems',
      label: 'Kit Progress',
      sortable: true,
      render: (value: number, row: WelcomeKit) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {value} / {row.totalItems}
            </span>
            <span className="text-xs text-gray-500">{row.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(row.completionPercentage)}`}
              style={{ width: `${row.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (value: string | undefined) => (
        <div className="text-sm text-gray-700">
          {value ? (
            new Date(value).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          ) : (
            <span className="text-gray-400">Not Issued</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: WelcomeKit['status']) => {
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
      render: (value: any, row: WelcomeKit) => (
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

  const departments = Array.from(new Set(mockKits.map(k => k.department)));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Gift className="h-8 w-8 text-blue-600" />
          Welcome Kit Distribution
        </h1>
        <p className="text-gray-600 mt-2">Track and manage welcome kit issuance for new employees</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
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
            <Package className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 font-medium">Issued</p>
              <p className="text-2xl font-bold text-green-900">{stats.issued}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 font-medium">Avg Completion</p>
              <p className="text-2xl font-bold text-purple-900">{stats.avgCompletion}%</p>
            </div>
            <Gift className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 font-medium">Mandatory</p>
              <p className="text-2xl font-bold text-red-900">{stats.mandatoryItems}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.totalKitItems}</p>
            </div>
            <Package className="h-8 w-8 text-indigo-400" />
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
                <option value="issued">Issued</option>
                <option value="returned_partial">Returned Partial</option>
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

      {/* Welcome Kits Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <DataTable
          data={filteredKits}
          columns={columns}
        />
      </div>

      {/* Welcome Kit Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Standard Welcome Kit Items
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {kitItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <item.icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{item.itemName}</h4>
                  {item.mandatory && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                    {item.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Kit Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Welcome Kit Distribution Guidelines
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Preparation:</strong> Welcome kit must be prepared 3 days before joining date</li>
          <li>• <strong>Distribution:</strong> Issued on Day 1 during orientation session</li>
          <li>• <strong>Acknowledgment:</strong> Employee must sign kit receipt acknowledgment form</li>
          <li>• <strong>Quality Check:</strong> All items inspected for quality before issuance</li>
          <li>• <strong>Size Selection:</strong> T-shirts and safety shoes sized as per employee measurements</li>
          <li>• <strong>Tech Items:</strong> Laptop/mobile issued with asset tracking number and accessories</li>
          <li>• <strong>Return Policy:</strong> All company property must be returned on separation</li>
          <li>• <strong>Replacement:</strong> Lost/damaged items replaced with cost recovery from employee</li>
        </ul>
      </div>
    </div>
  );
}
