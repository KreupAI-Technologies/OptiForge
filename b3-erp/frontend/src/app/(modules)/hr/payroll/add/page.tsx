'use client';

import React, { useState, useEffect } from 'react';
import { MasterDataService, MDEmployee } from '@/services/master-data.service';
import { PayrollService } from '@/services/payroll.service';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calculator,
  Clock,
  Search,
  ChevronDown,
  Building2,
  Briefcase,
} from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  basicSalary: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
  uanNumber: string;
}

interface FormData {
  employeeId: string;
  payPeriod: string;
  payDate: string;
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherAllowances: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  esi: number;
  loans: number;
  otherDeductions: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  overtimeHours: number;
  remarks: string;
}

export default function AddPayrollPage() {
  const router = useRouter();

  // Seed fallback — kept as unused backup per wiring convention
  const allEmployeesSeed: Employee[] = [
    {
      id: '1',
      employeeId: 'B3-0001',
      name: 'Rajesh Kumar',
      department: 'Production',
      position: 'Production Supervisor',
      email: 'rajesh.kumar@b3erp.com',
      phone: '+91 98765 43210',
      basicSalary: 45000,
      bankName: 'HDFC Bank',
      accountNumber: '50100123456789',
      ifscCode: 'HDFC0001234',
      panNumber: 'ABCDE1234F',
      uanNumber: '101234567890',
    },
    {
      id: '2',
      employeeId: 'B3-0002',
      name: 'Priya Sharma',
      department: 'Quality Control',
      position: 'QC Inspector',
      email: 'priya.sharma@b3erp.com',
      phone: '+91 98765 43211',
      basicSalary: 38000,
      bankName: 'ICICI Bank',
      accountNumber: '50200234567890',
      ifscCode: 'ICIC0002345',
      panNumber: 'BCDEF2345G',
      uanNumber: '201234567890',
    },
    {
      id: '3',
      employeeId: 'B3-0003',
      name: 'Amit Patel',
      department: 'Procurement',
      position: 'Procurement Officer',
      email: 'amit.patel@b3erp.com',
      phone: '+91 98765 43212',
      basicSalary: 42000,
      bankName: 'SBI',
      accountNumber: '50300345678901',
      ifscCode: 'SBIN0003456',
      panNumber: 'CDEFG3456H',
      uanNumber: '301234567890',
    },
    {
      id: '4',
      employeeId: 'B3-0004',
      name: 'Sunita Reddy',
      department: 'Finance',
      position: 'Accounts Manager',
      email: 'sunita.reddy@b3erp.com',
      phone: '+91 98765 43213',
      basicSalary: 55000,
      bankName: 'Axis Bank',
      accountNumber: '50400456789012',
      ifscCode: 'UTIB0004567',
      panNumber: 'DEFGH4567I',
      uanNumber: '401234567890',
    },
    {
      id: '5',
      employeeId: 'B3-0005',
      name: 'Vikram Singh',
      department: 'HR',
      position: 'HR Executive',
      email: 'vikram.singh@b3erp.com',
      phone: '+91 98765 43214',
      basicSalary: 40000,
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '50500567890123',
      ifscCode: 'KKBK0005678',
      panNumber: 'EFGHI5678J',
      uanNumber: '501234567890',
    },
  ];

  const [allEmployees, setAllEmployees] = useState<Employee[]>(allEmployeesSeed);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    payPeriod: '',
    payDate: '',
    basicSalary: 0,
    hra: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    otherAllowances: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0,
    esi: 0,
    loans: 0,
    otherDeductions: 0,
    workingDays: 26,
    presentDays: 0,
    leaveDays: 0,
    overtimeHours: 0,
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setEmployeesLoading(true);
    MasterDataService.getEmployees().then((live) => {
      if (live.length > 0) {
        setAllEmployees(live.map((e: MDEmployee): Employee => ({
          id: e.id,
          employeeId: e.employeeCode || e.id,
          name: e.fullName || [e.firstName, e.lastName].filter(Boolean).join(' ') || e.employeeCode || e.id,
          department: e.department || '',
          position: e.designation || '',
          email: '',
          phone: '',
          basicSalary: 0,
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          panNumber: '',
          uanNumber: '',
        })));
      }
      setEmployeesLoading(false);
    });
  }, []);

  const filteredEmployees = allEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData((prev) => ({
      ...prev,
      employeeId: employee.employeeId,
      basicSalary: employee.basicSalary,
      hra: Math.round(employee.basicSalary * 0.4),
      transportAllowance: 3000,
      medicalAllowance: 2500,
      specialAllowance: Math.round(employee.basicSalary * 0.1),
      providentFund: Math.round(employee.basicSalary * 0.12),
    }));
    setShowEmployeeSearch(false);
    setEmployeeSearchQuery('');
    if (errors.employeeId) {
      setErrors((prev) => ({ ...prev, employeeId: '' }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const calculateOvertimePay = () => {
    if (formData.workingDays === 0 || formData.overtimeHours === 0) return 0;
    const hourlyRate = (formData.basicSalary / formData.workingDays) / 8;
    return Math.round(formData.overtimeHours * hourlyRate * 1.5);
  };

  const calculateGrossSalary = () => {
    return (
      formData.basicSalary +
      formData.hra +
      formData.transportAllowance +
      formData.medicalAllowance +
      formData.specialAllowance +
      formData.otherAllowances +
      calculateOvertimePay()
    );
  };

  const calculateTotalDeductions = () => {
    return (
      formData.providentFund +
      formData.professionalTax +
      formData.incomeTax +
      formData.esi +
      formData.loans +
      formData.otherDeductions
    );
  };

  const calculateNetSalary = () => {
    return calculateGrossSalary() - calculateTotalDeductions();
  };

  const autoCalculatePF = () => {
    const pf = Math.round(formData.basicSalary * 0.12);
    handleInputChange('providentFund', pf);
  };

  const autoCalculateESI = () => {
    const esi = Math.round(calculateGrossSalary() * 0.0075);
    handleInputChange('esi', esi);
  };

  const autoCalculateHRA = () => {
    const hra = Math.round(formData.basicSalary * 0.4);
    handleInputChange('hra', hra);
  };

  const generatePayrollNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PAY-${year}-${random}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }

    if (!formData.payPeriod) {
      newErrors.payPeriod = 'Pay period is required';
    }

    if (!formData.payDate) {
      newErrors.payDate = 'Payment date is required';
    }

    if (formData.basicSalary <= 0) {
      newErrors.basicSalary = 'Basic salary must be greater than 0';
    }

    if (formData.workingDays <= 0) {
      newErrors.workingDays = 'Working days must be greater than 0';
    }

    if (formData.presentDays > formData.workingDays) {
      newErrors.presentDays = 'Present days cannot exceed working days';
    }

    if (formData.leaveDays > formData.workingDays) {
      newErrors.leaveDays = 'Leave days cannot exceed working days';
    }

    if (formData.overtimeHours < 0) {
      newErrors.overtimeHours = 'Overtime hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError('Please fix all errors before submitting');
      return;
    }
    if (submitting) return;

    const payrollData = {
      payrollNumber: generatePayrollNumber(),
      ...formData,
      overtimePay: calculateOvertimePay(),
      grossSalary: calculateGrossSalary(),
      totalDeductions: calculateTotalDeductions(),
      netSalary: calculateNetSalary(),
      status: 'draft',
      createdDate: new Date().toISOString(),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await PayrollService.createPayrollRecord(payrollData);
      router.push('/hr/payroll');
    } catch {
      setSubmitError('Failed to create payroll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const grossSalary = calculateGrossSalary();
  const totalDeductions = calculateTotalDeductions();
  const netSalary = calculateNetSalary();
  const overtimePay = calculateOvertimePay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Payroll</h1>
              <p className="text-gray-600 mt-1">Create a new payroll entry</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{grossSalary.toLocaleString('en-IN')}</div>
            <div className="text-green-100 text-sm mt-1">Gross Salary</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{totalDeductions.toLocaleString('en-IN')}</div>
            <div className="text-red-100 text-sm mt-1">Total Deductions</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">₹{netSalary.toLocaleString('en-IN')}</div>
            <div className="text-blue-100 text-sm mt-1">Net Salary</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Employee Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Employee Selection
            </h3>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeSearch(!showEmployeeSearch)}
                    className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
                      errors.employeeId ? 'border-red-500' : 'border-gray-300'
                    } ${selectedEmployee ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    {selectedEmployee ? (
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedEmployee.name} ({selectedEmployee.employeeId})
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedEmployee.department} - {selectedEmployee.position}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500">Click to select employee</span>
                    )}
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {showEmployeeSearch && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={employeeSearchQuery}
                            onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                            placeholder="Search by name, ID, or department..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {employeesLoading && (
                          <div className="p-3 text-center text-gray-500 text-sm">Loading employees…</div>
                        )}
                        {!employeesLoading && filteredEmployees.map((employee) => (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() => handleSelectEmployee(employee)}
                            className="w-full p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{employee.name}</p>
                                <p className="text-sm text-gray-600">
                                  {employee.employeeId} - {employee.department}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{employee.position}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{employee.basicSalary.toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-500">Basic Salary</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.employeeId}
                  </p>
                )}
              </div>

              {selectedEmployee && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="text-xs text-blue-700 font-medium">Bank</label>
                    <p className="text-sm font-semibold text-blue-900 mt-1">
                      {selectedEmployee.bankName}
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">{selectedEmployee.accountNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium">PAN Number</label>
                    <p className="text-sm font-semibold text-blue-900 mt-1">
                      {selectedEmployee.panNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium">UAN Number</label>
                    <p className="text-sm font-semibold text-blue-900 mt-1">
                      {selectedEmployee.uanNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Period *
                </label>
                <input
                  type="text"
                  value={formData.payPeriod}
                  onChange={(e) => handleInputChange('payPeriod', e.target.value)}
                  placeholder="e.g., October 2025"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.payPeriod ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.payPeriod && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.payPeriod}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={formData.payDate}
                  onChange={(e) => handleInputChange('payDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.payDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.payDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.payDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Attendance Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days *
                </label>
                <input
                  type="number"
                  value={formData.workingDays}
                  onChange={(e) => handleInputChange('workingDays', parseInt(e.target.value) || 0)}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.workingDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.workingDays && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.workingDays}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Present Days *
                </label>
                <input
                  type="number"
                  value={formData.presentDays}
                  onChange={(e) => handleInputChange('presentDays', parseInt(e.target.value) || 0)}
                  min="0"
                  max={formData.workingDays}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.presentDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.presentDays && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.presentDays}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Days
                </label>
                <input
                  type="number"
                  value={formData.leaveDays}
                  onChange={(e) => handleInputChange('leaveDays', parseInt(e.target.value) || 0)}
                  min="0"
                  max={formData.workingDays}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.leaveDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Hours
                </label>
                <input
                  type="number"
                  value={formData.overtimeHours}
                  onChange={(e) => handleInputChange('overtimeHours', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.overtimeHours > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Overtime Pay: ₹{overtimePay.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Earnings
              </h3>
              <button
                type="button"
                onClick={autoCalculateHRA}
                className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
              >
                <Calculator className="w-3 h-3" />
                Auto HRA (40%)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Salary *
                </label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleInputChange('basicSalary', parseInt(e.target.value) || 0)}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.basicSalary ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.basicSalary && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.basicSalary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House Rent Allowance (HRA)
                </label>
                <input
                  type="number"
                  value={formData.hra}
                  onChange={(e) => handleInputChange('hra', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Allowance
                </label>
                <input
                  type="number"
                  value={formData.transportAllowance}
                  onChange={(e) => handleInputChange('transportAllowance', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Allowance
                </label>
                <input
                  type="number"
                  value={formData.medicalAllowance}
                  onChange={(e) => handleInputChange('medicalAllowance', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Allowance
                </label>
                <input
                  type="number"
                  value={formData.specialAllowance}
                  onChange={(e) => handleInputChange('specialAllowance', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Allowances
                </label>
                <input
                  type="number"
                  value={formData.otherAllowances}
                  onChange={(e) => handleInputChange('otherAllowances', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Deductions
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={autoCalculatePF}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  Auto PF (12%)
                </button>
                <button
                  type="button"
                  onClick={autoCalculateESI}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  Auto ESI (0.75%)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provident Fund (PF)
                </label>
                <input
                  type="number"
                  value={formData.providentFund}
                  onChange={(e) => handleInputChange('providentFund', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Tax
                </label>
                <input
                  type="number"
                  value={formData.professionalTax}
                  onChange={(e) => handleInputChange('professionalTax', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Tax (TDS)
                </label>
                <input
                  type="number"
                  value={formData.incomeTax}
                  onChange={(e) => handleInputChange('incomeTax', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ESI
                </label>
                <input
                  type="number"
                  value={formData.esi}
                  onChange={(e) => handleInputChange('esi', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Repayment
                </label>
                <input
                  type="number"
                  value={formData.loans}
                  onChange={(e) => handleInputChange('loans', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Deductions
                </label>
                <input
                  type="number"
                  value={formData.otherDeductions}
                  onChange={(e) => handleInputChange('otherDeductions', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h3>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              rows={3}
              placeholder="Add any additional notes or remarks"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Generating…' : 'Generate Payroll'}
            </button>
          </div>
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</div>
          )}
        </form>
      </div>
    </div>
  );
}
