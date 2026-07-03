'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Filter, Calendar, AlertCircle, CheckCircle, Clock, Mail, Phone, Building2, Users, RefreshCw, Download } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { HrPagesService } from '@/services/hr-pages.service';

interface ContractEmployee {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  contractType: 'fixed_term' | 'project_based' | 'seasonal' | 'consultant';
  startDate: string;
  endDate: string;
  duration: string;
  vendor: string;
  vendorContact: string;
  location: string;
  supervisor: string;
  contractValue: number;
  paymentTerm: 'monthly' | 'weekly' | 'milestone' | 'hourly';
  renewalEligible: boolean;
  renewalCount: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'renewed' | 'terminated';
  performanceRating: number;
  skills: string[];
  daysToExpiry?: number;
}

export default function ContractEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedContractType, setSelectedContractType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [contractEmployees, setContractEmployees] = useState<ContractEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.employees<any[]>();
        const contractOnly = (raw ?? []).filter((e) =>
          String(e.employmentType ?? '').toLowerCase().includes('contract'),
        );
        const mapped: ContractEmployee[] = contractOnly.map((e) => {
          const fullName = e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
          const endDate = e.contractEndDate ?? e.probationEndDate ?? '';
          const startDate = e.contractStartDate ?? e.joiningDate ?? '';
          const daysToExpiry = endDate
            ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : undefined;
          const s = String(e.status ?? '').toLowerCase();
          let status: ContractEmployee['status'] = 'active';
          if (s.includes('terminat')) status = 'terminated';
          else if (s.includes('renew')) status = 'renewed';
          else if (e.isActive === false || (daysToExpiry !== undefined && daysToExpiry < 0)) status = 'expired';
          else if (daysToExpiry !== undefined && daysToExpiry <= 60) status = 'expiring_soon';
          return {
            id: String(e.id ?? ''),
            employeeCode: e.employeeCode ?? '',
            name: fullName || (e.employeeCode ?? ''),
            designation: e.designationId ? String(e.designationId) : '',
            department: e.departmentId ? String(e.departmentId) : '',
            email: e.companyEmail ?? e.personalEmail ?? '',
            phone: e.mobileNumber ?? '',
            contractType: (e.contractType as ContractEmployee['contractType']) ?? 'fixed_term',
            startDate,
            endDate,
            duration: e.duration ?? '',
            vendor: e.vendor ?? '',
            vendorContact: e.vendorContact ?? '',
            location: [e.city, e.state].filter(Boolean).join(', '),
            supervisor: e.reportingManagerId ? String(e.reportingManagerId) : '',
            contractValue: Number(e.contractValue ?? 0),
            paymentTerm: (e.paymentTerm as ContractEmployee['paymentTerm']) ?? 'monthly',
            renewalEligible: Boolean(e.renewalEligible ?? false),
            renewalCount: Number(e.renewalCount ?? 0),
            status,
            performanceRating: Number(e.performanceRating ?? 0),
            skills: Array.isArray(e.skills) ? e.skills : [],
            daysToExpiry,
          };
        });
        if (!cancelled) setContractEmployees(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load contract employees');
          setContractEmployees([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock data for contract employees
  const mockContractEmployees: ContractEmployee[] = [
    {
      id: 'CE001',
      employeeCode: 'CTR2023001',
      name: 'Arjun Mehta',
      designation: 'Contract QA Tester',
      department: 'Quality',
      email: 'arjun.mehta@vendor.com',
      phone: '+91 98765 12345',
      contractType: 'fixed_term',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      duration: '2 years',
      vendor: 'QualityPro Solutions',
      vendorContact: 'Rajesh Kumar - 98765 43210',
      location: 'Quality Lab - Building B',
      supervisor: 'Meera Nair',
      contractValue: 840000,
      paymentTerm: 'monthly',
      renewalEligible: true,
      renewalCount: 1,
      status: 'expiring_soon',
      performanceRating: 4.2,
      skills: ['Manual Testing', 'Test Case Design', 'Bug Tracking'],
      daysToExpiry: 45
    },
    {
      id: 'CE002',
      employeeCode: 'CTR2023002',
      name: 'Priya Iyer',
      designation: 'SAP Consultant',
      department: 'IT',
      email: 'priya.iyer@consultant.com',
      phone: '+91 98765 12346',
      contractType: 'consultant',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      duration: '1 year',
      vendor: 'Tech Consultancy Group',
      vendorContact: 'Amit Shah - 98765 43211',
      location: 'IT Department - 3rd Floor',
      supervisor: 'Rahul Verma',
      contractValue: 1800000,
      paymentTerm: 'monthly',
      renewalEligible: true,
      renewalCount: 0,
      status: 'active',
      performanceRating: 4.8,
      skills: ['SAP MM', 'SAP FICO', 'SAP Implementation'],
      daysToExpiry: 178
    },
    {
      id: 'CE003',
      employeeCode: 'CTR2023003',
      name: 'Karthik Reddy',
      designation: 'Production Operator',
      department: 'Production',
      email: 'karthik.reddy@manpower.com',
      phone: '+91 98765 12347',
      contractType: 'seasonal',
      startDate: '2024-09-01',
      endDate: '2025-02-28',
      duration: '6 months',
      vendor: 'ManPower Services',
      vendorContact: 'Suresh Babu - 98765 43212',
      location: 'Plant A - Floor 1',
      supervisor: 'Rajesh Kumar Sharma',
      contractValue: 210000,
      paymentTerm: 'monthly',
      renewalEligible: false,
      renewalCount: 2,
      status: 'active',
      performanceRating: 3.9,
      skills: ['Machine Operation', 'Quality Check', 'Safety Protocol'],
      daysToExpiry: 88
    },
    {
      id: 'CE004',
      employeeCode: 'CTR2022004',
      name: 'Lakshmi Krishnan',
      designation: 'HR Coordinator',
      department: 'Human Resources',
      email: 'lakshmi.k@hrservices.com',
      phone: '+91 98765 12348',
      contractType: 'fixed_term',
      startDate: '2022-03-01',
      endDate: '2024-11-30',
      duration: '2 years 9 months',
      vendor: 'HR Outsourcing Ltd',
      vendorContact: 'Sunita Reddy - 98765 43213',
      location: 'HR Department - 2nd Floor',
      supervisor: 'Sunita Rao',
      contractValue: 720000,
      paymentTerm: 'monthly',
      renewalEligible: true,
      renewalCount: 1,
      status: 'expiring_soon',
      performanceRating: 4.5,
      skills: ['Recruitment', 'Onboarding', 'Employee Relations'],
      daysToExpiry: 28
    },
    {
      id: 'CE005',
      employeeCode: 'CTR2024005',
      name: 'Manoj Sharma',
      designation: 'Warehouse Helper',
      department: 'Logistics',
      email: 'manoj.sharma@logistics.com',
      phone: '+91 98765 12349',
      contractType: 'project_based',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      duration: '5.5 months',
      vendor: 'Logistics Support Services',
      vendorContact: 'Vinod Kumar - 98765 43214',
      location: 'Warehouse - Section C',
      supervisor: 'Lakshmi Iyer',
      contractValue: 165000,
      paymentTerm: 'weekly',
      renewalEligible: false,
      renewalCount: 0,
      status: 'expired',
      performanceRating: 3.6,
      skills: ['Material Handling', 'Inventory Management', 'Forklift Operation'],
      daysToExpiry: -155
    },
    {
      id: 'CE006',
      employeeCode: 'CTR2024006',
      name: 'Neha Joshi',
      designation: 'Graphic Designer',
      department: 'Marketing',
      email: 'neha.joshi@creative.com',
      phone: '+91 98765 12350',
      contractType: 'project_based',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      duration: '10 months',
      vendor: 'Creative Solutions',
      vendorContact: 'Anil Gupta - 98765 43215',
      location: 'Marketing - 4th Floor',
      supervisor: 'Kavita Malhotra',
      contractValue: 480000,
      paymentTerm: 'milestone',
      renewalEligible: true,
      renewalCount: 0,
      status: 'active',
      performanceRating: 4.7,
      skills: ['Adobe Photoshop', 'Illustrator', 'Video Editing'],
      daysToExpiry: 58
    },
    {
      id: 'CE007',
      employeeCode: 'CTR2023007',
      name: 'Santosh Yadav',
      designation: 'Security Officer',
      department: 'Security',
      email: 'santosh.yadav@security.com',
      phone: '+91 98765 12351',
      contractType: 'fixed_term',
      startDate: '2023-04-01',
      endDate: '2025-03-31',
      duration: '2 years',
      vendor: 'SecureGuard Services',
      vendorContact: 'Ramesh Singh - 98765 43216',
      location: 'Main Gate',
      supervisor: 'Manoj Tiwari',
      contractValue: 360000,
      paymentTerm: 'monthly',
      renewalEligible: true,
      renewalCount: 2,
      status: 'active',
      performanceRating: 4.1,
      skills: ['Access Control', 'Surveillance', 'Emergency Response'],
      daysToExpiry: 152
    },
    {
      id: 'CE008',
      employeeCode: 'CTR2024008',
      name: 'Divya Nambiar',
      designation: 'Research Analyst',
      department: 'Research',
      email: 'divya.nambiar@research.com',
      phone: '+91 98765 12352',
      contractType: 'consultant',
      startDate: '2024-02-01',
      endDate: '2024-11-15',
      duration: '9.5 months',
      vendor: 'Research Associates',
      vendorContact: 'Dr. Vijay Kumar - 98765 43217',
      location: 'R&D Center - Building D',
      supervisor: 'Dr. Sunita Rao',
      contractValue: 750000,
      paymentTerm: 'monthly',
      renewalEligible: true,
      renewalCount: 0,
      status: 'expiring_soon',
      performanceRating: 4.6,
      skills: ['Data Analysis', 'Market Research', 'Statistical Tools'],
      daysToExpiry: 12
    },
  ];

  const departments = ['all', 'Production', 'Quality', 'IT', 'Human Resources', 'Logistics', 'Marketing', 'Security', 'Research'];
  const contractTypes = ['all', 'fixed_term', 'project_based', 'seasonal', 'consultant'];

  const filteredData = useMemo(() => {
    return contractEmployees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesContractType = selectedContractType === 'all' || emp.contractType === selectedContractType;
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesContractType && matchesStatus;
    });
  }, [contractEmployees, searchTerm, selectedDepartment, selectedContractType, selectedStatus]);

  const stats = useMemo(() => {
    const active = contractEmployees.filter(e => e.status === 'active').length;
    const expiringSoon = contractEmployees.filter(e => e.status === 'expiring_soon').length;
    const expired = contractEmployees.filter(e => e.status === 'expired').length;
    const totalValue = contractEmployees.reduce((sum, e) => sum + e.contractValue, 0);
    return {
      total: contractEmployees.length,
      active,
      expiringSoon,
      expired,
      totalValue
    };
  }, [contractEmployees]);

  const activeFilterCount = [
    selectedDepartment !== 'all',
    selectedContractType !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expiring_soon': return 'text-orange-600';
      case 'expired': return 'text-red-600';
      case 'renewed': return 'text-blue-600';
      case 'terminated': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getContractTypeBadge = (type: string) => {
    const badges = {
      fixed_term: 'bg-blue-100 text-blue-700',
      project_based: 'bg-purple-100 text-purple-700',
      seasonal: 'bg-green-100 text-green-700',
      consultant: 'bg-orange-100 text-orange-700'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const columns = [
    {
      key: 'employeeCode',
      label: 'Employee Code',
      sortable: true,
      render: (v: string, row: ContractEmployee) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.name}</div>
        </div>
      )
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
      render: (v: string, row: ContractEmployee) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.department}</div>
        </div>
      )
    },
    {
      key: 'contractType',
      label: 'Contract Type',
      sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractTypeBadge(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'vendor',
      label: 'Vendor',
      sortable: true,
      render: (v: string, row: ContractEmployee) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.vendorContact}</div>
        </div>
      )
    },
    {
      key: 'endDate',
      label: 'Contract Period',
      sortable: true,
      render: (v: string, row: ContractEmployee) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(row.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">{row.duration}</div>
          {row.daysToExpiry !== undefined && row.daysToExpiry > 0 && row.daysToExpiry <= 60 && (
            <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {row.daysToExpiry} days left
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contractValue',
      label: 'Contract Value',
      sortable: true,
      render: (v: number, row: ContractEmployee) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">₹{v.toLocaleString()}</div>
          <div className="text-xs text-gray-500 capitalize">{row.paymentTerm}</div>
        </div>
      )
    },
    {
      key: 'performanceRating',
      label: 'Performance',
      sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-1">
          <div className={`font-semibold ${v >= 4.5 ? 'text-green-600' : v >= 4.0 ? 'text-blue-600' : v >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>
            {v.toFixed(1)}
          </div>
          <span className="text-xs text-gray-500">/ 5.0</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    {
      key: 'renewalEligible',
      label: 'Renewal',
      render: (v: boolean, row: ContractEmployee) => (
        <div className="text-sm">
          {v ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Eligible
            </div>
          ) : (
            <div className="text-gray-500">Not Eligible</div>
          )}
          {row.renewalCount > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Renewed {row.renewalCount}x
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-purple-600" />
          Contract Employees
        </h1>
        <p className="text-gray-600 mt-2">Manage contract workers and temporary staff</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading contract employees…
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contracts</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-blue-600">₹{(stats.totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Contract Employees List</h2>
            <span className="text-sm text-gray-500">({filteredData.length} employees)</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <RefreshCw className="h-4 w-4" />
              Renewal Queue
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <FileText className="h-4 w-4" />
              New Contract
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, code, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
              <select
                value={selectedContractType}
                onChange={(e) => setSelectedContractType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {contractTypes.map(type => (
                  <option key={type} value={type}>{type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="renewed">Renewed</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Expiring Soon Alert */}
      {stats.expiringSoon > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">Contracts Expiring Soon</h3>
              <p className="text-sm text-orange-700">
                {stats.expiringSoon} contract{stats.expiringSoon > 1 ? 's are' : ' is'} expiring within 60 days. Review and initiate renewal process if needed.
              </p>
            </div>
            <button className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
