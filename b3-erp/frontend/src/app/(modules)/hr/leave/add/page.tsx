'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmployeeService } from '@/services/employee.service';
import { LeaveService } from '@/services/leave.service';
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  UserCheck,
  Upload,
  X,
  AlertCircle,
  Search,
  Building2,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  leaveBalance: {
    casualLeave: number;
    sickLeave: number;
    privilegeLeave: number;
  };
}

interface FormData {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  contactDuringLeave: string;
  emergencyContact: string;
  emergencyPhone: string;
  handoverTo: string;
  handoverNotes: string;
}

export default function AddLeavePage() {
  const router = useRouter();

  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    contactDuringLeave: '',
    emergencyContact: '',
    emergencyPhone: '',
    handoverTo: '',
    handoverNotes: '',
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rawTypes = await LeaveService.getAllLeaveTypesRaw();
        if (!cancelled) {
          setLeaveTypeOptions(
            (rawTypes as any[]).map((t) => ({ id: String(t.id ?? ''), name: t.name ?? '' })),
          );
        }
      } catch {
        if (!cancelled) setLeaveTypeOptions([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await EmployeeService.getAllEmployeesRaw();
        const mapped: Employee[] = (raw as any[]).map((r) => {
          const fullName = r?.fullName ?? [r?.firstName, r?.lastName].filter(Boolean).join(' ').trim();
          return {
            id: String(r?.id ?? ''),
            employeeId: r?.employeeCode ?? '',
            name: fullName || '',
            department: r?.departmentName ?? r?.department ?? '',
            position: r?.designation ?? '',
            email: r?.email ?? '',
            phone: r?.phone ?? '',
            leaveBalance: {
              casualLeave: r?.leaveBalance?.casualLeave ?? 0,
              sickLeave: r?.leaveBalance?.sickLeave ?? 0,
              privilegeLeave: r?.leaveBalance?.privilegeLeave ?? 0,
            },
          };
        });
        if (!cancelled) setAllEmployees(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setAllEmployees([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const leaveTypes = [
    { value: 'Casual Leave', balance: 'casualLeave' },
    { value: 'Sick Leave', balance: 'sickLeave' },
    { value: 'Privilege Leave', balance: 'privilegeLeave' },
    { value: 'Maternity Leave', balance: null },
    { value: 'Paternity Leave', balance: null },
    { value: 'Compassionate Leave', balance: null },
    { value: 'Loss of Pay', balance: null },
  ];

  const filteredEmployees = allEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData((prev) => ({ ...prev, employeeId: employee.employeeId }));
    setShowEmployeeSearch(false);
    setEmployeeSearchQuery('');
    if (errors.employeeId) {
      setErrors((prev) => ({ ...prev, employeeId: '' }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const calculateTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
    return 0;
  };

  const getLeaveBalance = () => {
    if (!selectedEmployee || !formData.leaveType) return null;

    const leaveType = leaveTypes.find((lt) => lt.value === formData.leaveType);
    if (!leaveType || !leaveType.balance) return null;

    return selectedEmployee.leaveBalance[leaveType.balance as keyof typeof selectedEmployee.leaveBalance];
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Check leave balance
      const totalDays = calculateTotalDays();
      const balance = getLeaveBalance();
      if (balance !== null && totalDays > balance) {
        newErrors.leaveType = `Insufficient leave balance. Available: ${balance} days, Requested: ${totalDays} days`;
      }
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    if (formData.contactDuringLeave && !/^[+]?[\d\s-]{10,}$/.test(formData.contactDuringLeave)) {
      newErrors.contactDuringLeave = 'Invalid phone number';
    }

    if (formData.emergencyPhone && !/^[+]?[\d\s-]{10,}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Invalid phone number';
    }

    if (!formData.handoverTo) {
      newErrors.handoverTo = 'Handover person is required';
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
    if (isSubmitting) return;

    // Resolve backend employeeId + leaveTypeId.
    const employeeId = selectedEmployee?.id ?? '';
    const match = leaveTypeOptions.find(
      (t) =>
        t.name.toLowerCase() === formData.leaveType.toLowerCase() ||
        t.name.toLowerCase().includes(formData.leaveType.toLowerCase()),
    );
    const leaveTypeId = match?.id ?? '';
    if (!employeeId) {
      setSubmitError('Unable to resolve the selected employee record.');
      return;
    }
    if (!leaveTypeId) {
      setSubmitError(`No matching leave type found for "${formData.leaveType}".`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await LeaveService.applyLeave({
        employeeId,
        leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        contactDuringLeave: formData.contactDuringLeave,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        handoverTo: formData.handoverTo,
        handoverNotes: formData.handoverNotes,
        totalDays: calculateTotalDays(),
      } as any);
      router.push('/hr/leave');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to submit leave request',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDays = calculateTotalDays();
  const leaveBalance = getLeaveBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">Loading…</div>)}
        {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
        {submitError && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>)}
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
              <h1 className="text-3xl font-bold text-gray-900">New Leave Request</h1>
              <p className="text-gray-600 mt-1">Submit a new leave application</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Employee Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Employee Information
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
                        {filteredEmployees.map((employee) => (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() => handleSelectEmployee(employee)}
                            className="w-full p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {employee.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {employee.employeeId} - {employee.department}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{employee.position}</p>
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
                    <label className="text-xs text-blue-700 font-medium">Email</label>
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {selectedEmployee.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium">Phone</label>
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {selectedEmployee.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium">Department</label>
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {selectedEmployee.department}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leave Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Leave Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => handleInputChange('leaveType', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.leaveType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Leave Type</option>
                  {(leaveTypeOptions.length > 0
                    ? leaveTypeOptions.map((t) => ({ value: t.name }))
                    : leaveTypes
                  ).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.value}
                    </option>
                  ))}
                </select>
                {errors.leaveType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.leaveType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Balance
                </label>
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  leaveBalance !== null
                    ? leaveBalance > 5
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  {leaveBalance !== null ? `${leaveBalance} days available` : 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Days Requested
                  </label>
                  {totalDays > 0 && leaveBalance !== null && (
                    <span className={`text-sm font-semibold ${
                      totalDays <= leaveBalance ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalDays <= leaveBalance ? '✓ Within balance' : '⚠ Exceeds balance'}
                    </span>
                  )}
                </div>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-lg">
                  {totalDays} {totalDays === 1 ? 'day' : 'days'}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leave *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={4}
                  placeholder="Please provide a detailed reason for your leave request"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reason}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number During Leave
                </label>
                <input
                  type="tel"
                  value={formData.contactDuringLeave}
                  onChange={(e) => handleInputChange('contactDuringLeave', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contactDuringLeave ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.contactDuringLeave && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contactDuringLeave}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact person"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+91 98765 43211"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.emergencyPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.emergencyPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Handover Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Handover Details
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handover To *
                </label>
                <input
                  type="text"
                  value={formData.handoverTo}
                  onChange={(e) => handleInputChange('handoverTo', e.target.value)}
                  placeholder="Employee name to handover responsibilities"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.handoverTo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.handoverTo && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.handoverTo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handover Notes
                </label>
                <textarea
                  value={formData.handoverNotes}
                  onChange={(e) => handleInputChange('handoverNotes', e.target.value)}
                  rows={4}
                  placeholder="Provide detailed handover instructions and pending tasks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Supporting Documents
            </h3>

            <div className="space-y-2">
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="block">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleAddAttachment}
                  className="hidden"
                  id="file-upload"
                />
                <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Upload Document
                </div>
              </label>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB per file)
              </p>
            </div>
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
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Submitting…' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
