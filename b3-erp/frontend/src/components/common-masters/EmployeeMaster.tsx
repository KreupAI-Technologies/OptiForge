'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Users, Phone, Mail, MapPin, Calendar, Building, Shield, DollarSign, Download, Upload, Grid, List, User, Award } from 'lucide-react';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile: string;
  dateOfBirth: string;
  dateOfJoining: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  designation: string;
  department: string;
  reportingManager: string;
  workLocation: string;
  shiftPattern: string;
  personalInfo: {
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    nationality: string;
    bloodGroup: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  address: {
    current: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    permanent: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'savings' | 'checking';
  };
  salaryInfo: {
    basicSalary: number;
    allowances: number;
    currency: string;
    payFrequency: 'monthly' | 'bi_weekly' | 'weekly';
    taxBracket: string;
  };
  qualifications: {
    education: string;
    certifications: string[];
    skills: string[];
    experience: number;
  };
  documents: {
    photoUrl?: string;
    resumeUrl?: string;
    idProofUrl?: string;
    addressProofUrl?: string;
  };
  permissions: {
    systemAccess: boolean;
    roles: string[];
    accessLevel: 'basic' | 'advanced' | 'admin';
  };
  createdAt: string;
  updatedAt: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeCode: 'EMP001',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-123-4567',
    mobile: '+1-555-987-6543',
    dateOfBirth: '1985-06-15',
    dateOfJoining: '2020-03-01',
    status: 'active',
    employmentType: 'full_time',
    designation: 'Project Manager',
    department: 'Operations',
    reportingManager: 'Jane Wilson',
    workLocation: 'Head Office',
    shiftPattern: 'Regular (9 AM - 6 PM)',
    personalInfo: {
      gender: 'male',
      maritalStatus: 'married',
      nationality: 'American',
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Sarah Smith',
        relationship: 'Spouse',
        phone: '+1-555-555-1234'
      }
    },
    address: {
      current: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      },
      permanent: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      }
    },
    bankDetails: {
      bankName: 'First National Bank',
      accountNumber: '****5678',
      routingNumber: '021000021',
      accountType: 'checking'
    },
    salaryInfo: {
      basicSalary: 75000,
      allowances: 5000,
      currency: 'USD',
      payFrequency: 'monthly',
      taxBracket: '22%'
    },
    qualifications: {
      education: 'MBA - Project Management',
      certifications: ['PMP', 'Agile Scrum Master'],
      skills: ['Project Management', 'Team Leadership', 'Budget Planning'],
      experience: 8
    },
    documents: {
      photoUrl: '/photos/john-smith.jpg',
      resumeUrl: '/resumes/john-smith.pdf'
    },
    permissions: {
      systemAccess: true,
      roles: ['Project Manager', 'Team Lead'],
      accessLevel: 'advanced'
    },
    createdAt: '2020-03-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    employeeCode: 'EMP002',
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    phone: '+1-555-234-5678',
    mobile: '+1-555-876-5432',
    dateOfBirth: '1990-09-22',
    dateOfJoining: '2021-07-15',
    status: 'active',
    employmentType: 'full_time',
    designation: 'Sales Representative',
    department: 'Sales',
    reportingManager: 'Bob Wilson',
    workLocation: 'Branch Office',
    shiftPattern: 'Flexible Hours',
    personalInfo: {
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'American',
      bloodGroup: 'A+',
      emergencyContact: {
        name: 'Robert Johnson',
        relationship: 'Father',
        phone: '+1-555-555-9876'
      }
    },
    address: {
      current: {
        line1: '456 Oak Avenue',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601'
      },
      permanent: {
        line1: '789 Pine Street',
        city: 'Springfield',
        state: 'IL',
        country: 'USA',
        postalCode: '62701'
      }
    },
    bankDetails: {
      bankName: 'Community Bank',
      accountNumber: '****1234',
      routingNumber: '071000013',
      accountType: 'savings'
    },
    salaryInfo: {
      basicSalary: 45000,
      allowances: 3000,
      currency: 'USD',
      payFrequency: 'monthly',
      taxBracket: '12%'
    },
    qualifications: {
      education: 'Bachelor - Business Administration',
      certifications: ['Sales Professional Certification'],
      skills: ['Customer Relations', 'Sales Strategy', 'CRM Software'],
      experience: 3
    },
    documents: {
      photoUrl: '/photos/alice-johnson.jpg'
    },
    permissions: {
      systemAccess: true,
      roles: ['Sales Representative'],
      accessLevel: 'basic'
    },
    createdAt: '2021-07-15',
    updatedAt: '2024-01-10'
  }
];

import { hrMastersService } from '@/services/hr-masters.service';

const departments = ['Operations', 'Sales', 'Manufacturing', 'Finance', 'HR', 'IT', 'Quality', 'Purchasing'];
const designations = ['Manager', 'Assistant Manager', 'Team Lead', 'Senior Executive', 'Executive', 'Associate', 'Intern'];
const employmentTypes = ['full_time', 'part_time', 'contract', 'intern'];
const workLocations = ['Head Office', 'Branch Office', 'Manufacturing Plant', 'Remote', 'Field'];
const shiftPatterns = ['Regular (9 AM - 6 PM)', 'Morning (6 AM - 3 PM)', 'Evening (3 PM - 12 AM)', 'Night (12 AM - 9 AM)', 'Flexible Hours'];

export default function EmployeeMaster() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmploymentType, setFilterEmploymentType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState('basic');

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Using companyId '1' as default (mainCompany seeded in seed.ts)
        const data = await hrMastersService.getAllEmployees('1');

        // Transform backend data to match frontend interface
        const transformedEmployees: Employee[] = data.map(item => ({
          ...item,
          fullName: `${item.firstName} ${item.lastName}`,
          email: item.email || '',
          phone: item.phone || '',
          mobile: item.phone || '',
          dateOfBirth: '1990-01-01', // Fallback as backend model for now doesn't have it
          dateOfJoining: item.createdAt.split('T')[0],
          status: (item.status?.toLowerCase() || 'active') as any,
          employmentType: 'full_time',
          designation: item.designation?.name || 'Unassigned',
          department: item.department?.name || 'Unassigned',
          reportingManager: 'Unassigned',
          workLocation: item.branch?.name || 'Head Office',
          shiftPattern: 'Regular (9 AM - 6 PM)',
          personalInfo: {
            gender: 'other',
            maritalStatus: 'single',
            nationality: '',
            bloodGroup: '',
            emergencyContact: {
              name: '',
              relationship: '',
              phone: ''
            }
          },
          address: {
            current: { line1: '', city: '', state: '', country: '', postalCode: '' },
            permanent: { line1: '', city: '', state: '', country: '', postalCode: '' }
          },
          bankDetails: {
            bankName: '',
            accountNumber: '',
            routingNumber: '',
            accountType: 'checking'
          },
          salaryInfo: {
            basicSalary: 0,
            allowances: 0,
            currency: 'USD',
            payFrequency: 'monthly',
            taxBracket: ''
          },
          qualifications: {
            education: '',
            certifications: [],
            skills: [],
            experience: 0
          },
          documents: {},
          permissions: {
            systemAccess: item.isActive,
            roles: [],
            accessLevel: 'basic'
          },
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        setEmployees(transformedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    const matchesEmploymentType = filterEmploymentType === 'all' || employee.employmentType === filterEmploymentType;

    return matchesSearch && matchesDepartment && matchesStatus && matchesEmploymentType;
  });

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(employee => employee.id !== id));
    }
  };

  const handleSaveEmployee = (employeeData: any) => {
    if (editingEmployee) {
      setEmployees(employees.map(employee =>
        employee.id === editingEmployee.id
          ? { ...employee, ...employeeData, updatedAt: new Date().toISOString().split('T')[0] }
          : employee
      ));
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...employeeData,
        fullName: `${employeeData.firstName} ${employeeData.lastName}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setEmployees([...employees, newEmployee]);
    }
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      on_leave: 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  const getEmploymentTypeBadge = (type: string) => {
    const colors = {
      full_time: 'bg-green-100 text-green-800',
      part_time: 'bg-blue-100 text-blue-800',
      contract: 'bg-purple-100 text-purple-800',
      intern: 'bg-orange-100 text-orange-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`;
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateExperience = (dateOfJoining: string) => {
    const today = new Date();
    const joinDate = new Date(dateOfJoining);
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Employee Master
            </h1>
            <p className="text-gray-600">Manage employee information and records</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddEmployee}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
            <option value="on_leave">On Leave</option>
          </select>
          <select
            value={filterEmploymentType}
            onChange={(e) => setFilterEmploymentType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employment</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                          <div className="text-sm text-gray-500">{employee.employeeCode}</div>
                          <div className="text-sm text-gray-500">Age: {calculateAge(employee.dateOfBirth)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.designation}</div>
                      <div className="text-sm text-gray-500">{employee.department}</div>
                      <div className="text-sm text-gray-500">Reports to: {employee.reportingManager}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {employee.phone}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {employee.workLocation}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getEmploymentTypeBadge(employee.employmentType)}>
                        {employee.employmentType.replace('_', ' ')}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        Joined: {employee.dateOfJoining}
                      </div>
                      <div className="text-sm text-gray-500">
                        Experience: {calculateExperience(employee.dateOfJoining)} years
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(employee.salaryInfo.basicSalary + employee.salaryInfo.allowances).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Basic: ${employee.salaryInfo.basicSalary.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.salaryInfo.payFrequency}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(employee.status)}>
                        {employee.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{employee.fullName}</h3>
                    <p className="text-sm text-gray-500">{employee.employeeCode}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Designation:</span>
                  <span className="font-medium">{employee.designation}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {employee.phone}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium">${(employee.salaryInfo.basicSalary + employee.salaryInfo.allowances).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={getStatusBadge(employee.status)}>
                  {employee.status.replace('_', ' ')}
                </span>
                <span className={getEmploymentTypeBadge(employee.employmentType)}>
                  {employee.employmentType.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onClose={() => setShowModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

interface EmployeeModalProps {
  employee: Employee | null;
  onSave: (employee: any) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function EmployeeModal({ employee, onSave, onClose, activeTab, setActiveTab }: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    employeeCode: employee?.employeeCode || '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    mobile: employee?.mobile || '',
    dateOfBirth: employee?.dateOfBirth || '',
    dateOfJoining: employee?.dateOfJoining || '',
    status: employee?.status || 'active',
    employmentType: employee?.employmentType || 'full_time',
    designation: employee?.designation || '',
    department: employee?.department || '',
    reportingManager: employee?.reportingManager || '',
    workLocation: employee?.workLocation || '',
    shiftPattern: employee?.shiftPattern || '',
    personalInfo: employee?.personalInfo || {
      gender: 'male',
      maritalStatus: 'single',
      nationality: '',
      bloodGroup: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    address: employee?.address || {
      current: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      permanent: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      }
    },
    bankDetails: employee?.bankDetails || {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking'
    },
    salaryInfo: employee?.salaryInfo || {
      basicSalary: 0,
      allowances: 0,
      currency: 'USD',
      payFrequency: 'monthly',
      taxBracket: ''
    },
    qualifications: employee?.qualifications || {
      education: '',
      certifications: [],
      skills: [],
      experience: 0
    },
    permissions: employee?.permissions || {
      systemAccess: false,
      roles: [],
      accessLevel: 'basic'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'personal', label: 'Personal Details', icon: Calendar },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'employment', label: 'Employment', icon: Building },
    { id: 'salary', label: 'Salary & Bank', icon: DollarSign },
    { id: 'qualifications', label: 'Qualifications', icon: Award },
    { id: 'permissions', label: 'System Access', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-96">
          <div className="px-3 py-2">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'employment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                  <select
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Location</option>
                    {workLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift Pattern</label>
                  <select
                    value={formData.shiftPattern}
                    onChange={(e) => setFormData({ ...formData, shiftPattern: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Shift</option>
                    {shiftPatterns.map(shift => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Salary Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                      <input
                        type="number"
                        value={formData.salaryInfo.basicSalary}
                        onChange={(e) => setFormData({ ...formData, salaryInfo: { ...formData.salaryInfo, basicSalary: Number(e.target.value) } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                      <input
                        type="number"
                        value={formData.salaryInfo.allowances}
                        onChange={(e) => setFormData({ ...formData, salaryInfo: { ...formData.salaryInfo, allowances: Number(e.target.value) } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={formData.salaryInfo.currency}
                        onChange={(e) => setFormData({ ...formData, salaryInfo: { ...formData.salaryInfo, currency: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
                      <select
                        value={formData.salaryInfo.payFrequency}
                        onChange={(e) => setFormData({ ...formData, salaryInfo: { ...formData.salaryInfo, payFrequency: e.target.value as any } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="bi_weekly">Bi-weekly</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankDetails.bankName}
                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.bankDetails.accountNumber}
                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                      <input
                        type="text"
                        value={formData.bankDetails.routingNumber}
                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, routingNumber: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                      <select
                        value={formData.bankDetails.accountType}
                        onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountType: e.target.value as any } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {employee ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}