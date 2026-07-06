'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayrollService } from '@/services/payroll.service';
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
  CreditCard,
} from 'lucide-react';

interface PayrollEntry {
  id: string;
  payrollNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  payPeriod: string;
  payDate: string;
  status: string;
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

export default function EditPayrollPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Mock data - replace with API call
  const [payroll] = useState<PayrollEntry>({
    id: params.id,
    payrollNumber: 'PAY-2025-0001',
    employeeId: 'B3-0001',
    employeeName: 'Rajesh Kumar',
    department: 'Production',
    position: 'Production Supervisor',
    payPeriod: 'October 2025',
    payDate: '2025-10-30',
    status: 'draft',
    basicSalary: 45000,
    hra: 18000,
    transportAllowance: 3000,
    medicalAllowance: 2500,
    specialAllowance: 5000,
    otherAllowances: 1500,
    providentFund: 5400,
    professionalTax: 200,
    incomeTax: 4500,
    esi: 675,
    loans: 2000,
    otherDeductions: 500,
    workingDays: 26,
    presentDays: 24,
    leaveDays: 2,
    overtimeHours: 8,
    remarks: 'Salary processed successfully for October 2025',
  });

  const [formData, setFormData] = useState({
    payDate: payroll.payDate,
    basicSalary: payroll.basicSalary,
    hra: payroll.hra,
    transportAllowance: payroll.transportAllowance,
    medicalAllowance: payroll.medicalAllowance,
    specialAllowance: payroll.specialAllowance,
    otherAllowances: payroll.otherAllowances,
    providentFund: payroll.providentFund,
    professionalTax: payroll.professionalTax,
    incomeTax: payroll.incomeTax,
    esi: payroll.esi,
    loans: payroll.loans,
    otherDeductions: payroll.otherDeductions,
    workingDays: payroll.workingDays,
    presentDays: payroll.presentDays,
    leaveDays: payroll.leaveDays,
    overtimeHours: payroll.overtimeHours,
    remarks: payroll.remarks,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load the real payroll record on mount and populate the form defensively.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await PayrollService.getPayrollRecordById(params.id);
        if (cancelled || !data) return;
        const toNum = (v: any, fallback: number): number =>
          v === null || v === undefined || Number.isNaN(Number(v)) ? fallback : Number(v);
        const toStr = (v: any, fallback: string): string =>
          v === null || v === undefined ? fallback : String(v);

        setFormData((prev) => ({
          payDate: toStr(data.payDate ?? data.paidAt, prev.payDate),
          basicSalary: toNum(data.basicSalary, prev.basicSalary),
          hra: toNum(data.hra ?? data.houseRentAllowance, prev.hra),
          transportAllowance: toNum(
            data.transportAllowance ?? data.conveyanceAllowance,
            prev.transportAllowance,
          ),
          medicalAllowance: toNum(data.medicalAllowance, prev.medicalAllowance),
          specialAllowance: toNum(data.specialAllowance, prev.specialAllowance),
          otherAllowances: toNum(data.otherAllowances ?? data.otherEarnings, prev.otherAllowances),
          providentFund: toNum(data.providentFund, prev.providentFund),
          professionalTax: toNum(data.professionalTax, prev.professionalTax),
          incomeTax: toNum(data.incomeTax, prev.incomeTax),
          esi: toNum(data.esi ?? data.esiContribution, prev.esi),
          loans: toNum(data.loans ?? data.loanDeduction, prev.loans),
          otherDeductions: toNum(data.otherDeductions, prev.otherDeductions),
          workingDays: toNum(data.workingDays, prev.workingDays),
          presentDays: toNum(data.presentDays, prev.presentDays),
          leaveDays: toNum(data.leaveDays, prev.leaveDays),
          overtimeHours: toNum(data.overtimeHours, prev.overtimeHours),
          remarks: toStr(data.remarks, prev.remarks),
        }));
      } catch (err) {
        // Keep existing form defaults if the record can't be loaded.
        console.error('Failed to load payroll record', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateOvertimePay = () => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      alert('Please fix all errors before submitting');
      return;
    }

    const payrollData = {
      companyId: 'default-company-id',
      ...formData,
      overtimePay: calculateOvertimePay(),
      grossSalary: calculateGrossSalary(),
      totalDeductions: calculateTotalDeductions(),
      netSalary: calculateNetSalary(),
    };

    setSaving(true);
    try {
      await PayrollService.updatePayrollRecord(params.id, payrollData);
      alert('Payroll updated successfully!');
      router.push(`/hr/payroll/view/${params.id}`);
    } catch (err) {
      console.error('Failed to update payroll', err);
      alert('Failed to update payroll. Please try again.');
    } finally {
      setSaving(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Payroll</h1>
              <p className="text-gray-600 mt-1">{payroll.payrollNumber} - {payroll.payPeriod}</p>
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

        {/* Employee Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Employee Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Employee ID</label>
              <p className="font-semibold text-gray-900">{payroll.employeeId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Employee Name</label>
              <p className="font-semibold text-gray-900">{payroll.employeeName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Department</label>
              <p className="font-semibold text-gray-900">{payroll.department}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Position</label>
              <p className="font-semibold text-gray-900">{payroll.position}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Payment Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Period
                </label>
                <input
                  type="text"
                  value={payroll.payPeriod}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                />
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
                {errors.leaveDays && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.leaveDays}
                  </p>
                )}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.overtimeHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.overtimeHours && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.overtimeHours}
                  </p>
                )}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Earnings
            </h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Remarks
            </h3>
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
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
