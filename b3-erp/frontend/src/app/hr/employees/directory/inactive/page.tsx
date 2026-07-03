'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UserX, Search, Filter, X, Download, Calendar, Mail, Phone, Building, Briefcase } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { HrPagesService } from '@/services/hr-pages.service';

interface InactiveEmployee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  separationDate: string;
  separationType: 'resignation' | 'termination' | 'retirement' | 'absconding' | 'death' | 'contract_end';
  separationReason: string;
  lastWorkingDay: string;
  exitInterviewDone: boolean;
  fnfSettled: boolean;
  documentsCollected: boolean;
  assetsReturned: boolean;
  rehireEligible: boolean;
  yearsOfService: number;
}

const mockInactiveEmployees: InactiveEmployee[] = [
  {
    id: 'E001', employeeCode: 'EMP001', name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '+91 9876543210',
    department: 'Production', designation: 'Operator', joiningDate: '2018-03-15', separationDate: '2025-09-30',
    separationType: 'resignation', separationReason: 'Better opportunity', lastWorkingDay: '2025-09-30',
    exitInterviewDone: true, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: true, yearsOfService: 7.5
  },
  {
    id: 'E002', employeeCode: 'EMP045', name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 9876543211',
    department: 'Quality', designation: 'QC Inspector', joiningDate: '2020-06-01', separationDate: '2025-08-15',
    separationType: 'resignation', separationReason: 'Personal reasons', lastWorkingDay: '2025-08-15',
    exitInterviewDone: true, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: true, yearsOfService: 5.2
  },
  {
    id: 'E003', employeeCode: 'EMP078', name: 'Suresh Babu', email: 'suresh.babu@example.com', phone: '+91 9876543212',
    department: 'Maintenance', designation: 'Technician', joiningDate: '2015-01-10', separationDate: '2025-07-31',
    separationType: 'retirement', separationReason: 'Reached retirement age (60)', lastWorkingDay: '2025-07-31',
    exitInterviewDone: true, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: false, yearsOfService: 10.6
  },
  {
    id: 'E004', employeeCode: 'EMP092', name: 'Anita Desai', email: 'anita.desai@example.com', phone: '+91 9876543213',
    department: 'HR', designation: 'HR Executive', joiningDate: '2021-04-12', separationDate: '2025-06-30',
    separationType: 'resignation', separationReason: 'Relocation', lastWorkingDay: '2025-06-30',
    exitInterviewDone: true, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: true, yearsOfService: 4.2
  },
  {
    id: 'E005', employeeCode: 'EMP103', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 9876543214',
    department: 'Production', designation: 'Supervisor', joiningDate: '2019-02-20', separationDate: '2025-05-15',
    separationType: 'termination', separationReason: 'Performance issues', lastWorkingDay: '2025-05-15',
    exitInterviewDone: false, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: false, yearsOfService: 6.3
  },
  {
    id: 'E006', employeeCode: 'EMP156', name: 'Meera Nair', email: 'meera.nair@example.com', phone: '+91 9876543215',
    department: 'Stores', designation: 'Storekeeper', joiningDate: '2022-08-01', separationDate: '2025-04-30',
    separationType: 'contract_end', separationReason: 'Contract period completed', lastWorkingDay: '2025-04-30',
    exitInterviewDone: true, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: true, yearsOfService: 2.8
  },
  {
    id: 'E007', employeeCode: 'EMP189', name: 'Karthik Iyer', email: 'karthik.iyer@example.com', phone: '+91 9876543216',
    department: 'IT', designation: 'IT Support', joiningDate: '2023-01-15', separationDate: '2025-03-31',
    separationType: 'absconding', separationReason: 'Absconded without notice', lastWorkingDay: '2025-03-15',
    exitInterviewDone: false, fnfSettled: false, documentsCollected: false, assetsReturned: false, rehireEligible: false, yearsOfService: 2.2
  },
  {
    id: 'E008', employeeCode: 'EMP234', name: 'Divya Reddy', email: 'divya.reddy@example.com', phone: '+91 9876543217',
    department: 'Finance', designation: 'Accountant', joiningDate: '2017-11-20', separationDate: '2025-02-28',
    separationType: 'resignation', separationReason: 'Higher studies', lastWorkingDay: '2025-02-28',
    exitInterviewDone: true, fnfSettled: true, documentsCollected: true, assetsReturned: true, rehireEligible: true, yearsOfService: 7.3
  }
];

const departments = ['All Departments', 'Production', 'Quality', 'Maintenance', 'HR', 'Stores', 'IT', 'Finance'];

export default function InactiveEmployeesPage() {
  const [employees, setEmployees] = useState<InactiveEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('All Departments');
  const [filterSeparationType, setFilterSeparationType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sepTypes: InactiveEmployee['separationType'][] = [
      'resignation', 'termination', 'retirement', 'absconding', 'death', 'contract_end',
    ];
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.employees<any[]>();
        const inactiveOnly = (raw ?? []).filter((e) => {
          const s = String(e.status ?? '').toLowerCase();
          return e.isActive === false || (s !== '' && s !== 'active');
        });
        const mapped: InactiveEmployee[] = inactiveOnly.map((e) => {
          const fullName = e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
          const joiningDate = e.joiningDate ?? '';
          const separationDate = e.separationDate ?? e.lastWorkingDay ?? '';
          const yearsOfService = joiningDate && separationDate
            ? Math.round(
                ((new Date(separationDate).getTime() - new Date(joiningDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 365)) * 10,
              ) / 10
            : 0;
          const sep = String(e.separationType ?? '').toLowerCase();
          return {
            id: String(e.id ?? ''),
            employeeCode: e.employeeCode ?? '',
            name: fullName || (e.employeeCode ?? ''),
            email: e.companyEmail ?? e.personalEmail ?? '',
            phone: e.mobileNumber ?? '',
            department: e.departmentId ? String(e.departmentId) : '',
            designation: e.designationId ? String(e.designationId) : '',
            joiningDate,
            separationDate,
            separationType: (sepTypes.includes(sep as InactiveEmployee['separationType'])
              ? (sep as InactiveEmployee['separationType'])
              : 'resignation'),
            separationReason: e.separationReason ?? '',
            lastWorkingDay: e.lastWorkingDay ?? separationDate,
            exitInterviewDone: Boolean(e.exitInterviewDone ?? false),
            fnfSettled: Boolean(e.fnfSettled ?? false),
            documentsCollected: Boolean(e.documentsCollected ?? false),
            assetsReturned: Boolean(e.assetsReturned ?? false),
            rehireEligible: Boolean(e.rehireEligible ?? false),
            yearsOfService,
          };
        });
        if (!cancelled) setEmployees(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load inactive employees');
          setEmployees([]);
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

  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDepartment === 'All Departments' || emp.department === filterDepartment;
      const matchesType = filterSeparationType === 'all' || emp.separationType === filterSeparationType;
      return matchesSearch && matchesDept && matchesType;
    });
  }, [employees, searchTerm, filterDepartment, filterSeparationType]);

  const getSeparationTypeBadge = (type: string) => {
    const typeMap: Record<string, { status: 'success' | 'error' | 'warning' | 'inactive'; text: string }> = {
      'resignation': { status: 'warning', text: 'Resignation' },
      'termination': { status: 'error', text: 'Termination' },
      'retirement': { status: 'success', text: 'Retirement' },
      'absconding': { status: 'error', text: 'Absconding' },
      'death': { status: 'inactive', text: 'Death' },
      'contract_end': { status: 'inactive', text: 'Contract End' }
    };
    const config = typeMap[type] || { status: 'inactive' as const, text: type };
    return <StatusBadge status={config.status} text={config.text} />;
  };

  const columns: Column<InactiveEmployee>[] = [
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'name',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.employeeCode}</div>
          <div className="text-xs text-gray-500">{row.department} • {row.designation}</div>
        </div>
      )
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: 'email',
      sortable: false,
      render: (v, row) => (
        <div className="text-xs">
          <div className="flex items-center gap-1 text-gray-700">
            <Mail className="w-3 h-3" />
            {v}
          </div>
          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <Phone className="w-3 h-3" />
            {row.phone}
          </div>
        </div>
      )
    },
    {
      id: 'tenure',
      header: 'Service Period',
      accessor: 'joiningDate',
      sortable: true,
      render: (v, row) => (
        <div className="text-xs">
          <div className="text-gray-700">Joined: {new Date(v).toLocaleDateString()}</div>
          <div className="text-gray-700">Left: {new Date(row.separationDate).toLocaleDateString()}</div>
          <div className="text-blue-600 font-medium mt-1">{row.yearsOfService} years</div>
        </div>
      )
    },
    {
      id: 'separation',
      header: 'Separation',
      accessor: 'separationType',
      sortable: true,
      render: (v, row) => (
        <div>
          {getSeparationTypeBadge(v)}
          <div className="text-xs text-gray-600 mt-1">{row.separationReason}</div>
          <div className="text-xs text-gray-500 mt-1">LWD: {new Date(row.lastWorkingDay).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      id: 'clearance',
      header: 'Clearance Status',
      accessor: 'fnfSettled',
      sortable: false,
      render: (_, row) => (
        <div className="text-xs space-y-1">
          <div className={`${row.exitInterviewDone ? 'text-green-600' : 'text-red-600'}`}>
            {row.exitInterviewDone ? '✓' : '✗'} Exit Interview
          </div>
          <div className={`${row.fnfSettled ? 'text-green-600' : 'text-red-600'}`}>
            {row.fnfSettled ? '✓' : '✗'} F&F Settled
          </div>
          <div className={`${row.assetsReturned ? 'text-green-600' : 'text-red-600'}`}>
            {row.assetsReturned ? '✓' : '✗'} Assets Returned
          </div>
          <div className={`${row.documentsCollected ? 'text-green-600' : 'text-red-600'}`}>
            {row.documentsCollected ? '✓' : '✗'} Documents Collected
          </div>
        </div>
      )
    },
    {
      id: 'rehire',
      header: 'Rehire',
      accessor: 'rehireEligible',
      sortable: true,
      render: (v) => (
        <div>
          {v ? (
            <StatusBadge status="success" text="Eligible" />
          ) : (
            <StatusBadge status="error" text="Not Eligible" />
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: () => (
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
      )
    }
  ];

  const stats = useMemo(() => {
    const total = employees.length;
    const resignation = employees.filter(e => e.separationType === 'resignation').length;
    const termination = employees.filter(e => e.separationType === 'termination').length;
    const retirement = employees.filter(e => e.separationType === 'retirement').length;
    const rehireEligible = employees.filter(e => e.rehireEligible).length;
    const avgServiceYears = employees.reduce((sum, e) => sum + e.yearsOfService, 0) / total;
    const pendingClearance = employees.filter(e => !e.fnfSettled || !e.assetsReturned).length;
    return { total, resignation, termination, retirement, rehireEligible, avgServiceYears, pendingClearance };
  }, [employees]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('All Departments');
    setFilterSeparationType('all');
  };

  const activeFilterCount = [filterDepartment !== 'All Departments', filterSeparationType !== 'all', searchTerm !== ''].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserX className="w-7 h-7 text-red-600" />
            Inactive Employees
          </h1>
          <p className="text-gray-600 mt-1">Separated and inactive employee records</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading inactive employees…
        </div>
      )}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Inactive</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Resignations</div>
          <div className="text-2xl font-bold text-blue-600">{stats.resignation}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Terminations</div>
          <div className="text-2xl font-bold text-red-600">{stats.termination}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Retirements</div>
          <div className="text-2xl font-bold text-green-600">{stats.retirement}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Avg Service</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgServiceYears.toFixed(1)}y</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Rehire Eligible</div>
          <div className="text-2xl font-bold text-orange-600">{stats.rehireEligible}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Pending Clearance</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingClearance}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by name, code, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Separation Type</label>
              <select value={filterSeparationType} onChange={(e) => setFilterSeparationType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Types</option>
                <option value="resignation">Resignation</option>
                <option value="termination">Termination</option>
                <option value="retirement">Retirement</option>
                <option value="absconding">Absconding</option>
                <option value="contract_end">Contract End</option>
                <option value="death">Death</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true, defaultSort: { column: 'tenure', direction: 'desc' } }} emptyMessage="No inactive employees found" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <UserX className="w-5 h-5 inline mr-2" />
          Inactive Employee Management
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Complete records of all separated employees with clearance status tracking</li>
          <li>✓ Separation type classification: resignation, termination, retirement, etc.</li>
          <li>✓ Exit process tracking: exit interview, F&F settlement, asset return, document collection</li>
          <li>✓ Rehire eligibility flag for future recruitment considerations</li>
          <li>✓ Service tenure analytics for retention and turnover analysis</li>
        </ul>
      </div>
    </div>
  );
}
