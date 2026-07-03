'use client';

import { useState, useMemo, useEffect } from 'react';
import { CreditCard, Search, Filter, X, Download, CheckCircle, Clock, AlertCircle, User, Calendar, Printer, Eye } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface IDCardRequest {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  photoUploaded: boolean;
  photoUrl?: string;
  bloodGroup: string;
  emergencyContact: string;
  requestDate: string;
  status: 'pending' | 'photo_pending' | 'in_design' | 'ready_to_print' | 'printed' | 'issued';
  cardNumber?: string;
  issueDate?: string;
  assignedTo: string;
}

export default function IDCardGenerationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCard, setSelectedCard] = useState<IDCardRequest | null>(null);

  const [mockIDCards, setMockIDCards] = useState<IDCardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('id-card');
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
        })) as IDCardRequest[];
        setMockIDCards(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockIDCards: IDCardRequest[] = [
    {
      id: '1',
      employeeCode: 'EMP2025001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Supervisor',
      department: 'Production',
      joiningDate: '2025-11-05',
      photoUploaded: true,
      photoUrl: '/photos/rajesh.jpg',
      bloodGroup: 'O+',
      emergencyContact: '+91 98765 43210',
      requestDate: '2025-10-20',
      status: 'ready_to_print',
      cardNumber: 'KMF-ID-2025-001',
      assignedTo: 'Priya Sharma'
    },
    {
      id: '2',
      employeeCode: 'EMP2025002',
      employeeName: 'Sneha Patel',
      designation: 'Quality Inspector',
      department: 'Quality Control',
      joiningDate: '2025-11-08',
      photoUploaded: true,
      photoUrl: '/photos/sneha.jpg',
      bloodGroup: 'A+',
      emergencyContact: '+91 98765 43211',
      requestDate: '2025-10-22',
      status: 'printed',
      cardNumber: 'KMF-ID-2025-002',
      assignedTo: 'Priya Sharma'
    },
    {
      id: '3',
      employeeCode: 'EMP2025003',
      employeeName: 'Amit Singh',
      designation: 'Warehouse Executive',
      department: 'Warehouse',
      joiningDate: '2025-11-10',
      photoUploaded: false,
      bloodGroup: 'B+',
      emergencyContact: '+91 98765 43212',
      requestDate: '2025-10-25',
      status: 'photo_pending',
      assignedTo: 'Rahul Verma'
    },
    {
      id: '4',
      employeeCode: 'EMP2025004',
      employeeName: 'Neha Gupta',
      designation: 'HR Executive',
      department: 'HR',
      joiningDate: '2025-11-01',
      photoUploaded: true,
      photoUrl: '/photos/neha.jpg',
      bloodGroup: 'AB+',
      emergencyContact: '+91 98765 43213',
      requestDate: '2025-10-15',
      status: 'issued',
      cardNumber: 'KMF-ID-2025-003',
      issueDate: '2025-10-28',
      assignedTo: 'Priya Sharma'
    },
    {
      id: '5',
      employeeCode: 'EMP2025005',
      employeeName: 'Vikram Rao',
      designation: 'Machine Operator',
      department: 'Production',
      joiningDate: '2025-11-12',
      photoUploaded: true,
      photoUrl: '/photos/vikram.jpg',
      bloodGroup: 'O-',
      emergencyContact: '+91 98765 43214',
      requestDate: '2025-10-28',
      status: 'in_design',
      assignedTo: 'Rahul Verma'
    },
    {
      id: '6',
      employeeCode: 'EMP2025006',
      employeeName: 'Priya Desai',
      designation: 'Accounts Manager',
      department: 'Finance',
      joiningDate: '2025-11-15',
      photoUploaded: false,
      bloodGroup: 'A-',
      emergencyContact: '+91 98765 43215',
      requestDate: '2025-10-29',
      status: 'pending',
      assignedTo: 'Priya Sharma'
    }
  ];

  const filteredCards = useMemo(() => {
    return mockIDCards.filter(card => {
      const matchesSearch = searchTerm === '' ||
        card.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || card.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [searchTerm, statusFilter, departmentFilter]);

  const stats = {
    total: mockIDCards.length,
    pending: mockIDCards.filter(c => c.status === 'pending').length,
    photoPending: mockIDCards.filter(c => c.status === 'photo_pending').length,
    inDesign: mockIDCards.filter(c => c.status === 'in_design').length,
    readyToPrint: mockIDCards.filter(c => c.status === 'ready_to_print').length,
    printed: mockIDCards.filter(c => c.status === 'printed').length,
    issued: mockIDCards.filter(c => c.status === 'issued').length
  };

  const getStatusColor = (status: IDCardRequest['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'photo_pending': 'bg-yellow-100 text-yellow-800',
      'in_design': 'bg-blue-100 text-blue-800',
      'ready_to_print': 'bg-purple-100 text-purple-800',
      'printed': 'bg-indigo-100 text-indigo-800',
      'issued': 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: IDCardRequest['status']) => {
    const icons = {
      'pending': Clock,
      'photo_pending': AlertCircle,
      'in_design': CreditCard,
      'ready_to_print': Printer,
      'printed': CheckCircle,
      'issued': CheckCircle
    };
    return icons[status];
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee Details',
      sortable: true,
      render: (value: string, row: IDCardRequest) => (
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
            row.photoUploaded ? 'bg-gradient-to-br from-green-400 to-blue-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'
          }`}>
            {row.photoUploaded ? <User className="w-6 h-6" /> : '?'}
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
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(value).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-md text-sm font-semibold">
          {value}
        </span>
      )
    },
    {
      key: 'cardNumber',
      label: 'Card Number',
      sortable: true,
      render: (value: string | undefined) => (
        <span className="text-sm font-mono text-gray-900">
          {value || '-'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: IDCardRequest['status']) => {
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
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: IDCardRequest) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCard(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
           
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'ready_to_print' && (
            <button
              className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
             
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
          {(row.status === 'printed' || row.status === 'issued') && (
            <button
              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
             
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const departments = Array.from(new Set(mockIDCards.map(c => c.department)));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Employee ID Card Generation
        </h1>
        <p className="text-gray-600 mt-2">Generate and track employee identification cards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-400" />
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

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-700 font-medium">Photo Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.photoPending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">In Design</p>
              <p className="text-2xl font-bold text-blue-900">{stats.inDesign}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 font-medium">Ready to Print</p>
              <p className="text-2xl font-bold text-purple-900">{stats.readyToPrint}</p>
            </div>
            <Printer className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Printed</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.printed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-indigo-400" />
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
                <option value="photo_pending">Photo Pending</option>
                <option value="in_design">In Design</option>
                <option value="ready_to_print">Ready to Print</option>
                <option value="printed">Printed</option>
                <option value="issued">Issued</option>
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

      {/* ID Cards Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredCards}
          columns={columns}
        />
      </div>

      {/* ID Card Workflow & Guidelines */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            ID Card Workflow
          </h3>
          <div className="space-y-3">
            {[
              { status: 'Pending', desc: 'New employee onboarding initiated', color: 'gray' },
              { status: 'Photo Pending', desc: 'Waiting for employee photo upload', color: 'yellow' },
              { status: 'In Design', desc: 'ID card design being prepared', color: 'blue' },
              { status: 'Ready to Print', desc: 'Design approved, ready for printing', color: 'purple' },
              { status: 'Printed', desc: 'ID card printed, awaiting issuance', color: 'indigo' },
              { status: 'Issued', desc: 'ID card issued to employee', color: 'green' }
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full bg-${step.color}-100 text-${step.color}-700 flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{step.status}</div>
                  <div className="text-sm text-gray-600">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            ID Card Guidelines
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Photo Requirements:</strong> Passport size, white background, formal attire, clear face visibility</li>
            <li>• <strong>Photo Format:</strong> JPG/PNG, minimum 300x400 pixels, max 2MB file size</li>
            <li>• <strong>Mandatory Fields:</strong> Employee Code, Name, Designation, Department, Blood Group, Emergency Contact</li>
            <li>• <strong>Design Timeline:</strong> 1-2 working days after photo upload</li>
            <li>• <strong>Printing:</strong> Batch printing done twice per week (Monday & Thursday)</li>
            <li>• <strong>Card Material:</strong> PVC card with QR code for access control</li>
            <li>• <strong>Validity:</strong> ID card must be renewed annually or when role changes</li>
            <li>• <strong>Lost Card:</strong> Report immediately to HR, replacement fee of ₹500 applicable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
