'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Search, Filter, Download, CheckCircle, Mail, Phone, Calendar, Building2, Award, AlertCircle } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { EmployeeService } from '@/services/employee.service';

interface ActiveEmployee {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  employeeType: 'permanent' | 'contract' | 'intern';
  workMode: 'onsite' | 'remote' | 'hybrid';
  location: string;
  supervisor: string;
  yearsOfService: number;
  performanceRating: number;
  lastAppraisal: string;
}

export default function ActiveEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [rows, setRows] = useState<ActiveEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await EmployeeService.getAllEmployees()) as any[];
        const typeMap: Record<string, ActiveEmployee['employeeType']> = {
          'Full Time': 'permanent', 'Permanent': 'permanent',
          'Contract': 'contract', 'Contractor': 'contract',
          'Intern': 'intern', 'Internship': 'intern',
        };
        const yearsSince = (d?: string) => {
          if (!d) return 0;
          const diff = Date.now() - new Date(d).getTime();
          return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
        };
        const mapped: ActiveEmployee[] = raw
          .filter((e) => {
            const s = String(e.status ?? e.employmentStatus ?? 'Active').toLowerCase();
            return !['inactive', 'terminated', 'resigned', 'exited'].includes(s);
          })
          .map((e) => ({
            id: e.id,
            employeeCode: e.employeeCode ?? '',
            name: e.fullName ?? [e.firstName, e.lastName].filter(Boolean).join(' '),
            designation: e.designation ?? e.designationName ?? '',
            department: e.departmentName ?? e.department ?? '',
            email: e.companyEmail ?? e.email ?? e.personalEmail ?? '',
            phone: e.mobileNumber ?? e.phone ?? '',
            joiningDate: e.joiningDate ?? e.dateOfJoining ?? '',
            employeeType: typeMap[e.employmentType] ?? 'permanent',
            workMode: (e.workMode as ActiveEmployee['workMode']) ?? 'onsite',
            location: e.city ?? e.location ?? '',
            supervisor: e.reportingManagerName ?? '',
            yearsOfService: yearsSince(e.joiningDate ?? e.dateOfJoining),
            performanceRating: Number(e.performanceRating ?? 0),
            lastAppraisal: e.lastAppraisal ?? '',
          }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load employees');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockActiveEmployees: ActiveEmployee[] = rows.length ? rows : [
    { id: 'AE001', employeeCode: 'KMF2020001', name: 'Rajesh Kumar Sharma', designation: 'Production Manager', department: 'Production',
      email: 'rajesh.sharma@company.com', phone: '+91 98765 43210', joiningDate: '2020-01-15', employeeType: 'permanent',
      workMode: 'onsite', location: 'Plant A', supervisor: 'VP Operations', yearsOfService: 4, performanceRating: 4.5, lastAppraisal: '2024-01-15' },
    { id: 'AE002', employeeCode: 'KMF2019002', name: 'Meera Nair', designation: 'Quality Control Head', department: 'Quality',
      email: 'meera.nair@company.com', phone: '+91 98765 43212', joiningDate: '2019-06-20', employeeType: 'permanent',
      workMode: 'onsite', location: 'Quality Lab', supervisor: 'VP Quality', yearsOfService: 5, performanceRating: 4.8, lastAppraisal: '2024-06-20' },
    { id: 'AE003', employeeCode: 'KMF2021003', name: 'Arun Patel', designation: 'Senior Software Engineer', department: 'IT',
      email: 'arun.patel@company.com', phone: '+91 98765 43214', joiningDate: '2021-03-10', employeeType: 'permanent',
      workMode: 'hybrid', location: 'IT Department', supervisor: 'IT Manager', yearsOfService: 3, performanceRating: 4.6, lastAppraisal: '2024-03-10' },
    { id: 'AE004', employeeCode: 'KMF2022004', name: 'Kavita Desai', designation: 'HR Executive', department: 'Human Resources',
      email: 'kavita.desai@company.com', phone: '+91 98765 43216', joiningDate: '2022-01-05', employeeType: 'permanent',
      workMode: 'onsite', location: 'HR Department', supervisor: 'HR Manager', yearsOfService: 2, performanceRating: 4.2, lastAppraisal: '2024-01-05' },
    { id: 'AE005', employeeCode: 'CTR2023001', name: 'Arjun Mehta', designation: 'QA Tester', department: 'Quality',
      email: 'arjun.mehta@vendor.com', phone: '+91 98765 12345', joiningDate: '2023-01-01', employeeType: 'contract',
      workMode: 'onsite', location: 'Quality Lab', supervisor: 'QC Head', yearsOfService: 1, performanceRating: 4.0, lastAppraisal: '2024-01-01' },
    { id: 'AE006', employeeCode: 'KMF2023006', name: 'Priya Menon', designation: 'Accounts Assistant', department: 'Finance',
      email: 'priya.menon@company.com', phone: '+91 98765 43220', joiningDate: '2023-06-01', employeeType: 'contract',
      workMode: 'hybrid', location: 'Finance Dept', supervisor: 'Finance Manager', yearsOfService: 1, performanceRating: 4.4, lastAppraisal: '2024-06-01' },
    { id: 'AE007', employeeCode: 'KMF2024007', name: 'Vikram Singh', designation: 'Production Supervisor', department: 'Production',
      email: 'vikram.singh@company.com', phone: '+91 98765 43218', joiningDate: '2024-02-15', employeeType: 'permanent',
      workMode: 'onsite', location: 'Plant A', supervisor: 'Production Manager', yearsOfService: 0, performanceRating: 4.0, lastAppraisal: '2024-08-15' },
    { id: 'AE008', employeeCode: 'INT2024001', name: 'Sneha Reddy', designation: 'Marketing Intern', department: 'Marketing',
      email: 'sneha.reddy@company.com', phone: '+91 98765 12380', joiningDate: '2024-06-01', employeeType: 'intern',
      workMode: 'hybrid', location: 'Marketing Dept', supervisor: 'Marketing Manager', yearsOfService: 0, performanceRating: 3.8, lastAppraisal: '2024-09-01' }
  ];

  const departments = ['all', 'Production', 'Quality', 'IT', 'Human Resources', 'Finance', 'Marketing'];
  const employeeTypes = ['all', 'permanent', 'contract', 'intern'];
  const workModes = ['all', 'onsite', 'remote', 'hybrid'];

  const filteredData = useMemo(() => {
    return mockActiveEmployees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesType = selectedType === 'all' || emp.employeeType === selectedType;
      const matchesWorkMode = selectedWorkMode === 'all' || emp.workMode === selectedWorkMode;
      return matchesSearch && matchesDepartment && matchesType && matchesWorkMode;
    });
  }, [searchTerm, selectedDepartment, selectedType, selectedWorkMode, rows]);

  const stats = useMemo(() => {
    const permanent = mockActiveEmployees.filter(e => e.employeeType === 'permanent').length;
    const contract = mockActiveEmployees.filter(e => e.employeeType === 'contract').length;
    const intern = mockActiveEmployees.filter(e => e.employeeType === 'intern').length;
    const remote = mockActiveEmployees.filter(e => e.workMode === 'remote').length;
    return { total: mockActiveEmployees.length, permanent, contract, intern, remote };
  }, []);

  const columns = [
    { key: 'employeeCode', label: 'Employee', sortable: true,
      render: (v: string, row: ActiveEmployee) => (
        <div><div className="font-semibold text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.name}</div></div>
      )
    },
    { key: 'designation', label: 'Designation', sortable: true,
      render: (v: string, row: ActiveEmployee) => (
        <div><div className="font-medium text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.department}</div></div>
      )
    },
    { key: 'email', label: 'Contact', render: (v: string, row: ActiveEmployee) => (
        <div className="text-sm"><div className="flex items-center gap-1 text-indigo-600"><Mail className="w-3 h-3" />{v}</div>
        <div className="flex items-center gap-1 text-gray-600 text-xs mt-1"><Phone className="w-3 h-3" />{row.phone}</div></div>
      )
    },
    { key: 'employeeType', label: 'Type', sortable: true,
      render: (v: string) => {
        const colors = { permanent: 'bg-green-100 text-green-700', contract: 'bg-purple-100 text-purple-700', intern: 'bg-blue-100 text-blue-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[v as keyof typeof colors]}`}>{v.toUpperCase()}</span>;
      }
    },
    { key: 'workMode', label: 'Work Mode', sortable: true,
      render: (v: string) => {
        const colors = { onsite: 'bg-blue-100 text-blue-700', remote: 'bg-green-100 text-green-700', hybrid: 'bg-orange-100 text-orange-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[v as keyof typeof colors]}`}>{v.toUpperCase()}</span>;
      }
    },
    { key: 'joiningDate', label: 'Joining Date', sortable: true,
      render: (v: string, row: ActiveEmployee) => (
        <div className="text-sm"><div className="font-medium text-gray-900">{new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div className="text-xs text-gray-500">{row.yearsOfService} year{row.yearsOfService !== 1 ? 's' : ''}</div></div>
      )
    },
    { key: 'performanceRating', label: 'Performance', sortable: true,
      render: (v: number) => <div className={`font-semibold ${v >= 4.5 ? 'text-green-600' : v >= 4.0 ? 'text-blue-600' : v >= 3.5 ? 'text-yellow-600' : 'text-red-600'}`}>{v.toFixed(1)} / 5.0</div>
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><CheckCircle className="h-8 w-8 text-green-600" />Active Employees</h1>
        <p className="text-gray-600 mt-2">Currently working employees directory</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading employees…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Active</p><p className="text-2xl font-bold text-green-600">{stats.total}</p></div>
          <CheckCircle className="w-8 h-8 text-green-400" /></div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Permanent</p><p className="text-2xl font-bold text-blue-600">{stats.permanent}</p></div>
          <Users className="w-8 h-8 text-blue-400" /></div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Contract</p><p className="text-2xl font-bold text-purple-600">{stats.contract}</p></div>
          <Building2 className="w-8 h-8 text-purple-400" /></div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Interns</p><p className="text-2xl font-bold text-orange-600">{stats.intern}</p></div>
          <Award className="w-8 h-8 text-orange-400" /></div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Remote</p><p className="text-2xl font-bold text-teal-600">{stats.remote}</p></div>
          <Calendar className="w-8 h-8 text-teal-400" /></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Active Employees List</h2>
            <span className="text-sm text-gray-500">({filteredData.length} employees)</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4" />Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name, code, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter className="w-5 h-5" />Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 pt-4 border-t">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {departments.map(dept => <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {employeeTypes.map(type => <option key={type} value={type}>{type === 'all' ? 'All Types' : type.toUpperCase()}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
              <select value={selectedWorkMode} onChange={(e) => setSelectedWorkMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {workModes.map(mode => <option key={mode} value={mode}>{mode === 'all' ? 'All Modes' : mode.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
