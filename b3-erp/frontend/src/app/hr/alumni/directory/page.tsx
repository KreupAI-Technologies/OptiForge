'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Briefcase, Calendar, Mail, Phone, Linkedin, Award, Building2, Users, TrendingUp, Download, Filter, X, Eye, MessageCircle, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/export';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface AlumniMember {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  joinDate: string;
  exitDate: string;
  tenure: string;
  currentCompany: string;
  currentDesignation: string;
  location: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  achievements: string[];
  industryExpertise: string[];
  willingToMentor: boolean;
  availableForRehire: boolean;
  status: 'active' | 'inactive';
  lastContactDate?: string;
  reasonForLeaving: 'career_growth' | 'higher_studies' | 'relocation' | 'personal' | 'retirement' | 'other';
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null);
  const [rows, setRows] = useState<AlumniMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getAlumni({ kind: 'member' });
        const mapped: AlumniMember[] = raw.map((r) => ({
          id: r.id,
          employeeCode: r.employeeCode ?? '',
          name: r.name ?? '',
          designation: r.designation ?? '',
          department: r.department ?? '',
          joinDate: r.joinDate ?? '',
          exitDate: r.exitDate ?? '',
          tenure: r.tenure ?? '',
          currentCompany: r.currentCompany ?? '',
          currentDesignation: r.currentDesignation ?? '',
          location: r.location ?? '',
          email: r.email ?? '',
          phone: r.phone ?? '',
          linkedinUrl: r.linkedinUrl ?? undefined,
          achievements: r.achievements ?? [],
          industryExpertise: r.industryExpertise ?? [],
          willingToMentor: r.willingToMentor ?? false,
          availableForRehire: r.availableForRehire ?? false,
          status: (r.status as AlumniMember['status']) ?? 'active',
          lastContactDate: r.lastContactDate ?? undefined,
          reasonForLeaving: (r.reasonForLeaving as AlumniMember['reasonForLeaving']) ?? 'other',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load alumni directory');
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

  const mockAlumni: AlumniMember[] = rows.length ? rows : [
    {
      id: '1',
      employeeCode: 'EMP001',
      name: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      joinDate: '2018-03-15',
      exitDate: '2024-08-31',
      tenure: '6 years 5 months',
      currentCompany: 'Tata Motors Ltd',
      currentDesignation: 'General Manager - Manufacturing',
      location: 'Pune, Maharashtra',
      email: 'rajesh.kumar@tata.com',
      phone: '+91 98765 43210',
      linkedinUrl: 'https://linkedin.com/in/rajeshkumar',
      achievements: ['Implemented Lean Manufacturing', 'Reduced waste by 35%', 'ISO 9001 Lead Auditor'],
      industryExpertise: ['Lean Manufacturing', 'Quality Management', 'Production Planning'],
      willingToMentor: true,
      availableForRehire: true,
      status: 'active',
      lastContactDate: '2025-10-15',
      reasonForLeaving: 'career_growth'
    },
    {
      id: '2',
      employeeCode: 'EMP045',
      name: 'Priya Sharma',
      designation: 'HR Manager',
      department: 'Human Resources',
      joinDate: '2019-07-01',
      exitDate: '2024-09-15',
      tenure: '5 years 2 months',
      currentCompany: 'Mahindra & Mahindra',
      currentDesignation: 'Head of HR - Operations',
      location: 'Mumbai, Maharashtra',
      email: 'priya.sharma@mahindra.com',
      phone: '+91 98765 43211',
      linkedinUrl: 'https://linkedin.com/in/priyasharma',
      achievements: ['Employee Engagement Score 85%', 'Reduced Attrition by 20%', 'POSH Certified'],
      industryExpertise: ['Talent Acquisition', 'Employee Relations', 'Compliance'],
      willingToMentor: true,
      availableForRehire: false,
      status: 'active',
      lastContactDate: '2025-09-30',
      reasonForLeaving: 'career_growth'
    },
    {
      id: '3',
      employeeCode: 'EMP123',
      name: 'Amit Patel',
      designation: 'Quality Assurance Lead',
      department: 'Quality',
      joinDate: '2017-02-10',
      exitDate: '2023-12-31',
      tenure: '6 years 10 months',
      currentCompany: 'Self-Employed',
      currentDesignation: 'Quality Consultant',
      location: 'Ahmedabad, Gujarat',
      email: 'amit.patel.qa@gmail.com',
      phone: '+91 98765 43212',
      achievements: ['Six Sigma Black Belt', 'Zero Defect Month Champion', 'Kaizen Expert'],
      industryExpertise: ['Six Sigma', 'Quality Auditing', 'Process Improvement'],
      willingToMentor: true,
      availableForRehire: true,
      status: 'active',
      lastContactDate: '2025-10-01',
      reasonForLeaving: 'career_growth'
    },
    {
      id: '4',
      employeeCode: 'EMP078',
      name: 'Sneha Reddy',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      joinDate: '2020-01-15',
      exitDate: '2024-06-30',
      tenure: '4 years 5 months',
      currentCompany: 'Larsen & Toubro',
      currentDesignation: 'Senior Engineer - Plant Maintenance',
      location: 'Hyderabad, Telangana',
      email: 'sneha.reddy@lnt.com',
      phone: '+91 98765 43213',
      achievements: ['TPM Implementation', 'CMMS Expert', 'OEE Improvement 15%'],
      industryExpertise: ['Preventive Maintenance', 'TPM', 'Asset Management'],
      willingToMentor: false,
      availableForRehire: true,
      status: 'active',
      lastContactDate: '2025-08-20',
      reasonForLeaving: 'career_growth'
    },
    {
      id: '5',
      employeeCode: 'EMP234',
      name: 'Vikram Singh',
      designation: 'IT Manager',
      department: 'Information Technology',
      joinDate: '2016-05-20',
      exitDate: '2024-03-31',
      tenure: '7 years 10 months',
      currentCompany: 'Infosys Ltd',
      currentDesignation: 'Project Manager',
      location: 'Bangalore, Karnataka',
      email: 'vikram.singh@infosys.com',
      phone: '+91 98765 43214',
      linkedinUrl: 'https://linkedin.com/in/vikramsingh',
      achievements: ['ERP Implementation Lead', 'Cloud Migration', 'PMP Certified'],
      industryExpertise: ['ERP Systems', 'Cloud Computing', 'Project Management'],
      willingToMentor: true,
      availableForRehire: false,
      status: 'active',
      lastContactDate: '2025-09-10',
      reasonForLeaving: 'higher_studies'
    }
  ];

  // Filter alumni
  const filteredAlumni = useMemo(() => {
    return mockAlumni.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.currentCompany.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepartment === 'all' || member.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || member.location.includes(selectedLocation);
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;

      return matchesSearch && matchesDept && matchesLocation && matchesStatus;
    });
  }, [mockAlumni, searchQuery, selectedDepartment, selectedLocation, selectedStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: mockAlumni.length,
    activeMentors: mockAlumni.filter(m => m.willingToMentor).length,
    rehireEligible: mockAlumni.filter(m => m.availableForRehire).length,
    avgTenure: (mockAlumni.reduce((sum, m) => {
      const years = parseFloat(m.tenure.split(' ')[0]);
      return sum + years;
    }, 0) / mockAlumni.length).toFixed(1)
  }), [mockAlumni]);

  const departments = ['all', ...Array.from(new Set(mockAlumni.map(m => m.department)))];
  const locations = ['all', 'Pune', 'Mumbai', 'Bangalore', 'Hyderabad', 'Ahmedabad'];

  const handleViewProfile = (member: AlumniMember) => {
    setSelectedMember(member);
    setShowProfileModal(true);
  };

  const handleExport = () => {
    exportToCsv('alumni-directory', filteredAlumni as unknown as Record<string, unknown>[]);
    toast({
      title: "Exporting Alumni Directory",
      description: `Exporting ${filteredAlumni.length} alumni records to Excel...`
    });
  };

  const handleSendMessage = (member: AlumniMember) => {
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${member.name}.`
    });
  };

  const handleRequestMentorship = (member: AlumniMember) => {
    toast({
      title: "Mentorship Request Sent",
      description: `Your mentorship request has been sent to ${member.name}.`
    });
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Alumni Directory</h1>
        <p className="text-sm text-gray-600 mt-1">Connect with our former employees and industry experts</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading alumni directory…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Alumni</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Mentors</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeMentors}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Rehire Eligible</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.rehireEligible}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Tenure</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.avgTenure} yrs</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, designation, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Alumni Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredAlumni.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header with Name and Status */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.employeeCode} • Worked {member.tenure}</p>
                </div>
                <div className="flex gap-2">
                  {member.willingToMentor && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Mentor
                    </span>
                  )}
                  {member.availableForRehire && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Rehire
                    </span>
                  )}
                </div>
              </div>

              {/* Previous Role */}
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Previous Role</p>
                <p className="text-sm font-semibold text-gray-900">{member.designation}</p>
                <p className="text-xs text-gray-600">{member.department} • {member.joinDate} to {member.exitDate}</p>
              </div>

              {/* Current Role */}
              <div className="mb-2">
                <div className="flex items-start gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{member.currentDesignation}</p>
                    <p className="text-sm text-gray-600">{member.currentCompany}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {member.location}
                </div>
              </div>

              {/* Expertise Tags */}
              {member.industryExpertise.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {member.industryExpertise.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewProfile(member)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  View Full Profile
                </button>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlumni.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No alumni found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6" />
                <h2 className="text-xl font-bold">Alumni Profile</h2>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedMember.name}</h3>
                    <p className="text-gray-600">{selectedMember.currentDesignation}</p>
                    <p className="text-gray-600 font-semibold">{selectedMember.currentCompany}</p>
                    <p className="text-sm text-gray-500 mt-1">Employee Code: {selectedMember.employeeCode}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedMember.willingToMentor && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Mentor Available
                    </span>
                  )}
                  {selectedMember.availableForRehire && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      Rehire Eligible
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Contact */}
              <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <a
                  href={`mailto:${selectedMember.email}`}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.email}</p>
                  </div>
                </a>
                <a
                  href={`tel:${selectedMember.phone}`}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.phone}</p>
                  </div>
                </a>
                {selectedMember.linkedinUrl && (
                  <a
                    href={selectedMember.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 border-2 border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600">LinkedIn</p>
                      <p className="text-sm font-medium text-blue-900">View Profile</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                {/* Previous Role at Company */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    Previous Role with Us
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Designation</p>
                      <p className="font-medium text-gray-900">{selectedMember.designation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{selectedMember.department}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Join Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedMember.joinDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Exit Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedMember.exitDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tenure</p>
                      <p className="font-medium text-green-700">{selectedMember.tenure}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reason for Leaving</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedMember.reasonForLeaving.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                {/* Current Role */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Current Role
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600">Designation</p>
                      <p className="font-medium text-blue-900">{selectedMember.currentDesignation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Company</p>
                      <p className="font-medium text-blue-900">{selectedMember.currentCompany}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Location</p>
                      <p className="font-medium text-blue-900 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedMember.location}
                      </p>
                    </div>
                    {selectedMember.lastContactDate && (
                      <div>
                        <p className="text-xs text-blue-600">Last Contact</p>
                        <p className="font-medium text-blue-900">
                          {new Date(selectedMember.lastContactDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {selectedMember.achievements.length > 0 && (
                <div className="mb-3 bg-green-50 rounded-lg p-5 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Key Achievements
                  </h4>
                  <ul className="space-y-2">
                    {selectedMember.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Industry Expertise */}
              {selectedMember.industryExpertise.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                    Industry Expertise & Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.industryExpertise.map((skill, idx) => (
                      <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {selectedMember.willingToMentor && (
                  <button
                    onClick={() => handleRequestMentorship(selectedMember)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <UserCheck className="h-5 w-5" />
                    Request Mentorship
                  </button>
                )}
                <button
                  onClick={() => handleSendMessage(selectedMember)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  <MessageCircle className="h-5 w-5" />
                  Send Message
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
