'use client';

import { useState, useMemo, useEffect } from 'react';
import { User, Search, Plus, Edit, Eye, Mail, Phone, MapPin, Calendar, Briefcase, Filter, Download, Upload, Building2, Users, Award, Clock, X } from 'lucide-react';
import DataTable from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { AddEmployeeProfileModal } from '@/components/hr/AddEmployeeProfileModal';
import { HrPagesService } from '@/services/hr-pages.service';

interface EmployeeProfile {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  joiningDate: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    company: string;
    position: string;
    duration: string;
  }[];
  skills: string[];
  certifications: string[];
  reportingTo: string;
  employeeType: 'permanent' | 'contract' | 'intern';
  workMode: 'onsite' | 'remote' | 'hybrid';
  shift: string;
  probationStatus: 'completed' | 'ongoing' | 'not_applicable';
  status: 'active' | 'inactive' | 'on_leave';
  avatar: string;
  aadharNumber?: string;
  panNumber?: string;
  pfNumber?: string;
  esiNumber?: string;
  bankAccount?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
}

export default function EmployeeProfilesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDesignation, setSelectedDesignation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.employees<any[]>();
        const genderMap: Record<string, EmployeeProfile['gender']> = {
          male: 'male', female: 'female', other: 'other', m: 'male', f: 'female',
        };
        const typeMap: Record<string, EmployeeProfile['employeeType']> = {
          permanent: 'permanent', contract: 'contract', intern: 'intern',
          'full-time': 'permanent', fulltime: 'permanent', contractual: 'contract',
        };
        const statusMap: Record<string, EmployeeProfile['status']> = {
          active: 'active', inactive: 'inactive', on_leave: 'on_leave', onleave: 'on_leave',
        };
        const mapped: EmployeeProfile[] = (raw ?? []).map((e) => {
          const fullName = e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
          const g = String(e.gender ?? '').toLowerCase();
          const t = String(e.employmentType ?? '').toLowerCase();
          const s = String(e.status ?? '').toLowerCase();
          return {
            id: String(e.id ?? ''),
            employeeCode: e.employeeCode ?? '',
            name: fullName || (e.employeeCode ?? ''),
            designation: e.designationId ? String(e.designationId) : '',
            department: e.departmentId ? String(e.departmentId) : '',
            email: e.companyEmail ?? e.personalEmail ?? '',
            phone: e.mobileNumber ?? '',
            location: [e.city, e.state].filter(Boolean).join(', '),
            joiningDate: e.joiningDate ?? '',
            dateOfBirth: e.dateOfBirth ?? '',
            gender: genderMap[g] ?? 'other',
            maritalStatus: (e.maritalStatus as EmployeeProfile['maritalStatus']) ?? 'single',
            bloodGroup: e.bloodGroup ?? '',
            address: e.address ?? '',
            city: e.city ?? '',
            state: e.state ?? '',
            pincode: e.pincode ?? '',
            emergencyContact: {
              name: e.emergencyContactName ?? '',
              relationship: e.emergencyContactRelationship ?? '',
              phone: e.emergencyContactPhone ?? '',
            },
            education: Array.isArray(e.education) ? e.education : [],
            experience: Array.isArray(e.experience) ? e.experience : [],
            skills: Array.isArray(e.skills) ? e.skills : [],
            certifications: Array.isArray(e.certifications) ? e.certifications : [],
            reportingTo: e.reportingManagerId ? String(e.reportingManagerId) : '',
            employeeType: typeMap[t] ?? 'permanent',
            workMode: (e.workMode as EmployeeProfile['workMode']) ?? 'onsite',
            shift: e.shift ?? '',
            probationStatus: e.confirmationDate
              ? 'completed'
              : e.probationEndDate
                ? 'ongoing'
                : 'not_applicable',
            status: statusMap[s] ?? (e.isActive === false ? 'inactive' : 'active'),
            avatar: (fullName || (e.employeeCode ?? '?'))
              .split(' ')
              .map((n: string) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase(),
          };
        });
        if (!cancelled) setProfiles(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load employee profiles');
          setProfiles([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleCreateProfile = async (data: any) => {
    setActionError(null);
    try {
      await HrPagesService.createEmployee({
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: String(data.gender || '').toUpperCase(),
        personalEmail: data.email,
        mobileNumber: data.phone,
        departmentId: data.department,
        designationId: data.designation,
        joiningDate: data.joiningDate,
        currentAddress: data.address || data.currentAddress || undefined,
      });
      setIsAddModalOpen(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create employee profile');
    }
  };

  const departments = ['all', 'Production', 'Quality', 'IT', 'Human Resources', 'Finance', 'Logistics', 'Research', 'Safety'];
  const designations = ['all', 'Production Manager', 'Quality Control Head', 'Senior Software Engineer', 'HR Executive', 'Production Supervisor', 'Accounts Assistant'];

  const filteredData = useMemo(() => {
    return profiles.filter(profile => {
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.phone.includes(searchTerm);
      const matchesDepartment = selectedDepartment === 'all' || profile.department === selectedDepartment;
      const matchesDesignation = selectedDesignation === 'all' || profile.designation === selectedDesignation;
      const matchesStatus = selectedStatus === 'all' || profile.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesDesignation && matchesStatus;
    });
  }, [profiles, searchTerm, selectedDepartment, selectedDesignation, selectedStatus]);

  const stats = useMemo(() => {
    const active = profiles.filter(p => p.status === 'active').length;
    const onProbation = profiles.filter(p => p.probationStatus === 'ongoing').length;
    const remote = profiles.filter(p => p.workMode === 'remote').length;
    return {
      total: profiles.length,
      active,
      onProbation,
      remote
    };
  }, [profiles]);

  const activeFilterCount = [
    selectedDepartment !== 'all',
    selectedDesignation !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length;

  const columns = [
    {
      key: 'employeeCode',
      label: 'Employee Code',
      sortable: true,
      render: (v: string, row: EmployeeProfile) => (
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
      render: (v: string, row: EmployeeProfile) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.department}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (v: string, row: EmployeeProfile) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-indigo-600">
            <Mail className="w-3 h-3" />
            {v}
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
            <Phone className="w-3 h-3" />
            {row.phone}
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (v: string, row: EmployeeProfile) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.workMode}</div>
        </div>
      )
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      sortable: true,
      render: (v: string, row: EmployeeProfile) => {
        const years = Math.floor((new Date().getTime() - new Date(v).getTime()) / (1000 * 60 * 60 * 24 * 365));
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="text-xs text-gray-500">{years} years</div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: EmployeeProfile) => (
        <button
          onClick={() => setSelectedProfile(row)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <User className="h-8 w-8 text-indigo-600" />
          Employee Profiles
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive employee information and profiles</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading employee profiles…
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Profiles</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Award className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Probation</p>
              <p className="text-2xl font-bold text-orange-600">{stats.onProbation}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remote Workers</p>
              <p className="text-2xl font-bold text-blue-600">{stats.remote}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">All Employee Profiles</h2>
            <span className="text-sm text-gray-500">({filteredData.length} profiles)</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Profile
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
              placeholder="Search by name, code, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {designations.map(des => (
                  <option key={des} value={des}>{des === 'all' ? 'All Designations' : des}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable data={filteredData} columns={columns} />

      {/* Profile Details Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto">
            {/* Header with gradient */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-16 left-8">
                <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center">
                  <span className="text-5xl font-bold text-indigo-600">{selectedProfile.avatar}</span>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-20 px-8 pb-8">
              {/* Name and Title */}
              <div className="mb-3">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedProfile.name}</h2>
                <p className="text-xl text-gray-600">{selectedProfile.designation}</p>
                <p className="text-sm text-gray-500">{selectedProfile.department} Department</p>
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge status={selectedProfile.status} />
                  <span className="text-sm text-gray-500">Employee Code: {selectedProfile.employeeCode}</span>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left Column - Contact & Personal */}
                <div className="space-y-3">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Mail className="w-4 h-4" />
                        {selectedProfile.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        {selectedProfile.phone}
                      </div>
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <div>
                          <div>{selectedProfile.address}</div>
                          <div>{selectedProfile.city}, {selectedProfile.state} - {selectedProfile.pincode}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedProfile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedProfile.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Marital Status:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedProfile.maritalStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium text-gray-900">{selectedProfile.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-red-900 mb-3">Emergency Contact</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-700">Name:</span>
                        <span className="font-medium text-red-900">{selectedProfile.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Relationship:</span>
                        <span className="font-medium text-red-900">{selectedProfile.emergencyContact.relationship}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Phone:</span>
                        <span className="font-medium text-red-900">{selectedProfile.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Employment & Education */}
                <div className="space-y-3">
                  {/* Employment Details */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                      Employment Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Joining Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedProfile.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee Type:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedProfile.employeeType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work Mode:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedProfile.workMode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shift:</span>
                        <span className="font-medium text-gray-900">{selectedProfile.shift}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{selectedProfile.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reporting To:</span>
                        <span className="font-medium text-gray-900">{selectedProfile.reportingTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Probation:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedProfile.probationStatus.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Education</h3>
                    <div className="space-y-3">
                      {selectedProfile.education.map((edu, idx) => (
                        <div key={idx} className="border-l-4 border-indigo-500 pl-3">
                          <div className="font-semibold text-gray-900 text-sm">{edu.degree}</div>
                          <div className="text-xs text-gray-600">{edu.institution}</div>
                          <div className="text-xs text-gray-500">Year: {edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Previous Experience */}
                  {selectedProfile.experience.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Previous Experience</h3>
                      <div className="space-y-3">
                        {selectedProfile.experience.map((exp, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-3">
                            <div className="font-semibold text-gray-900 text-sm">{exp.position}</div>
                            <div className="text-xs text-gray-600">{exp.company}</div>
                            <div className="text-xs text-gray-500">{exp.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Skills & Statutory */}
                <div className="space-y-3">
                  {/* Skills */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {selectedProfile.certifications.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        Certifications
                      </h3>
                      <div className="space-y-2">
                        {selectedProfile.certifications.map((cert, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statutory Information */}
                  {(selectedProfile.aadharNumber || selectedProfile.panNumber) && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Statutory Information</h3>
                      <div className="space-y-2 text-sm">
                        {selectedProfile.aadharNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Aadhar:</span>
                            <span className="font-medium text-gray-900">{selectedProfile.aadharNumber}</span>
                          </div>
                        )}
                        {selectedProfile.panNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">PAN:</span>
                            <span className="font-medium text-gray-900">{selectedProfile.panNumber}</span>
                          </div>
                        )}
                        {selectedProfile.pfNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">PF Number:</span>
                            <span className="font-medium text-gray-900 text-xs">{selectedProfile.pfNumber}</span>
                          </div>
                        )}
                        {selectedProfile.esiNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">ESI Number:</span>
                            <span className="font-medium text-gray-900">{selectedProfile.esiNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  {selectedProfile.bankAccount && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h3 className="text-lg font-bold text-green-900 mb-3">Bank Account</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Bank Name:</span>
                          <span className="font-medium text-green-900">{selectedProfile.bankAccount.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Account Number:</span>
                          <span className="font-medium text-green-900">{selectedProfile.bankAccount.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">IFSC Code:</span>
                          <span className="font-medium text-green-900">{selectedProfile.bankAccount.ifsc}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Profile
                </button>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Profile Modal */}
      <AddEmployeeProfileModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProfile}
      />
    </div>
  );
}
