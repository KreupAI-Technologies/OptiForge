'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Download, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface PayrollRegisterRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  daysWorked: number;
  daysPresent: number;
  basic: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  grossSalary: number;
  pfEmployee: number;
  pfEmployer: number;
  esi: number;
  pt: number;
  tds: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  monthYear: string;
}

export default function PayrollRegisterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');

  const [registerRecords, setRegisterRecords] = useState<PayrollRegisterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getReports('register');
        const mapped: PayrollRegisterRecord[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.recordNumber ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? '—',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          daysWorked: Number(r.daysWorked ?? r.details?.daysWorked ?? 0),
          daysPresent: Number(r.daysPresent ?? r.details?.daysPresent ?? 0),
          basic: Number(r.basic ?? r.details?.basic ?? 0),
          hra: Number(r.hra ?? r.details?.hra ?? 0),
          conveyance: Number(r.conveyance ?? r.details?.conveyance ?? 0),
          specialAllowance: Number(r.specialAllowance ?? r.details?.specialAllowance ?? 0),
          grossSalary: Number(r.grossSalary ?? r.details?.grossSalary ?? 0),
          pfEmployee: Number(r.pfEmployee ?? r.details?.pfEmployee ?? 0),
          pfEmployer: Number(r.pfEmployer ?? r.details?.pfEmployer ?? 0),
          esi: Number(r.esi ?? r.details?.esi ?? 0),
          pt: Number(r.pt ?? r.details?.pt ?? 0),
          tds: Number(r.tds ?? r.details?.tds ?? 0),
          otherDeductions: Number(r.otherDeductions ?? r.details?.otherDeductions ?? 0),
          totalDeductions: Number(r.totalDeductions ?? r.details?.totalDeductions ?? 0),
          netSalary: Number(r.netSalary ?? r.details?.netSalary ?? 0),
          monthYear: r.monthYear ?? r.details?.monthYear ?? '',
        }));
        if (!cancelled) setRegisterRecords(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load payroll register');
          setRegisterRecords([]);
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

  const filteredRecords = useMemo(() => {
    return registerRecords.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [registerRecords, searchTerm, selectedDepartment]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalStats = useMemo(() => {
    return filteredRecords.reduce((acc, record) => ({
      employees: acc.employees + 1,
      totalGross: acc.totalGross + record.grossSalary,
      totalDeductions: acc.totalDeductions + record.totalDeductions,
      totalNet: acc.totalNet + record.netSalary,
      totalPFEmployee: acc.totalPFEmployee + record.pfEmployee,
      totalPFEmployer: acc.totalPFEmployer + record.pfEmployer,
      totalESI: acc.totalESI + record.esi,
      totalPT: acc.totalPT + record.pt,
      totalTDS: acc.totalTDS + record.tds
    }), {
      employees: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalPFEmployee: 0,
      totalPFEmployer: 0,
      totalESI: 0,
      totalPT: 0,
      totalTDS: 0
    });
  }, [filteredRecords]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Register</h1>
        <p className="text-sm text-gray-600 mt-1">Comprehensive monthly salary register</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading payroll register…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && registerRecords.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No payroll register records found.
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
            <p className="text-sm text-gray-600 mt-1">Monthly Payroll Summary</p>
            <p className="text-xs text-gray-500 mt-1">Complete salary register for statutory compliance</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.employees}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Gross Salary</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalGross)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Deductions</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalDeductions)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Net Salary</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalNet)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employer Cost</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(totalStats.totalGross + totalStats.totalPFEmployer)}
                </p>
              </div>
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">Department</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-b">Days</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-green-50">Basic</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-green-50">HRA</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-green-50">Conveyance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-green-50">Special</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-green-100">Gross</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-red-50">PF</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-red-50">ESI</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-red-50">PT</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-red-50">TDS</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-red-50">Other</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-red-100">Deductions</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b bg-blue-100">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{record.employeeName}</p>
                    <p className="text-xs text-gray-500">{record.employeeId}</p>
                    <p className="text-xs text-gray-500">{record.designation}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{record.department}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">{record.daysPresent}/{record.daysWorked}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-green-50">{formatCurrency(record.basic)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-green-50">{formatCurrency(record.hra)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-green-50">{formatCurrency(record.conveyance)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-green-50">{formatCurrency(record.specialAllowance)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 bg-green-100">{formatCurrency(record.grossSalary)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-red-50">{formatCurrency(record.pfEmployee)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-red-50">{formatCurrency(record.esi)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-red-50">{formatCurrency(record.pt)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-red-50">{formatCurrency(record.tds)}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 bg-red-50">{formatCurrency(record.otherDeductions)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 bg-red-100">{formatCurrency(record.totalDeductions)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-blue-600 bg-blue-100">{formatCurrency(record.netSalary)}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="px-4 py-3 text-sm text-gray-900" colSpan={3}>TOTAL ({totalStats.employees} Employees)</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-green-50">{formatCurrency(filteredRecords.reduce((s, r) => s + r.basic, 0))}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-green-50">{formatCurrency(filteredRecords.reduce((s, r) => s + r.hra, 0))}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-green-50">{formatCurrency(filteredRecords.reduce((s, r) => s + r.conveyance, 0))}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-green-50">{formatCurrency(filteredRecords.reduce((s, r) => s + r.specialAllowance, 0))}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-green-100">{formatCurrency(totalStats.totalGross)}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-50">{formatCurrency(totalStats.totalPFEmployee)}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-50">{formatCurrency(totalStats.totalESI)}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-50">{formatCurrency(totalStats.totalPT)}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-50">{formatCurrency(totalStats.totalTDS)}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-50">{formatCurrency(filteredRecords.reduce((s, r) => s + r.otherDeductions, 0))}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-100">{formatCurrency(totalStats.totalDeductions)}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 bg-blue-100">{formatCurrency(totalStats.totalNet)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Payroll Register Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>Purpose:</strong> Statutory register to be maintained as per labor laws (Payment of Wages Act, Factories Act)</li>
          <li>• <strong>Contents:</strong> Complete details of earnings, deductions, and net payment for each employee</li>
          <li>• <strong>Retention:</strong> Register must be preserved for 3 years from last entry</li>
          <li>• <strong>Inspection:</strong> Must be available for inspection by labor authorities</li>
          <li>• <strong>Format:</strong> Can be maintained in physical or electronic form</li>
          <li>• <strong>Signature:</strong> Each entry should be signed/acknowledged by employee upon payment</li>
          <li>• <strong>Employer Cost:</strong> Includes gross salary + employer PF (12%) + employer ESI (3.0%)</li>
          <li>• <strong>Compliance:</strong> Essential for statutory audits and labor inspections</li>
        </ul>
      </div>
    </div>
  );
}
