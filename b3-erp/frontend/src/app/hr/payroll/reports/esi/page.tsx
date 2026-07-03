'use client';

import { useState, useMemo, useEffect } from 'react';
import { Heart, Search, Download, Users, DollarSign, FileText, Calendar } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface ESIRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  ipNumber: string;
  designation: string;
  department: string;
  grossWages: number;
  esiWages: number;
  esiEmployeeContribution: number;
  esiEmployerContribution: number;
  totalESI: number;
  daysWorked: number;
  monthYear: string;
}

export default function ESIReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');

  const mockESIRecords: ESIRecord[] = [
    {
      id: 'ESI-2025-11-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      ipNumber: '1234567890',
      designation: 'Senior Production Manager',
      department: 'Production',
      grossWages: 49725,
      esiWages: 21000,
      esiEmployeeContribution: 158,
      esiEmployerContribution: 630,
      totalESI: 788,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'ESI-2025-11-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      ipNumber: '2345678901',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      grossWages: 35976,
      esiWages: 21000,
      esiEmployeeContribution: 158,
      esiEmployerContribution: 630,
      totalESI: 788,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'ESI-2025-11-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      ipNumber: '3456789012',
      designation: 'Production Operator',
      department: 'Production',
      grossWages: 21874,
      esiWages: 21000,
      esiEmployeeContribution: 158,
      esiEmployerContribution: 630,
      totalESI: 788,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'ESI-2025-11-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      ipNumber: '4567890123',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      grossWages: 34101,
      esiWages: 21000,
      esiEmployeeContribution: 158,
      esiEmployerContribution: 630,
      totalESI: 788,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'ESI-2025-11-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      ipNumber: '5678901234',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      grossWages: 31600,
      esiWages: 21000,
      esiEmployeeContribution: 158,
      esiEmployerContribution: 630,
      totalESI: 788,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'ESI-2025-11-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      ipNumber: '6789012345',
      designation: 'HR Executive',
      department: 'HR',
      grossWages: 32849,
      esiWages: 21000,
      esiEmployeeContribution: 158,
      esiEmployerContribution: 630,
      totalESI: 788,
      daysWorked: 30,
      monthYear: 'November 2025'
    }
  ];

  const [rows, setRows] = useState<ESIRecord[]>(mockESIRecords);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getReports('esi');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.details?.employeeId ?? r.employeeCode ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            ipNumber: r.details?.ipNumber ?? r.ipNumber ?? '',
            designation: r.details?.designation ?? r.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            grossWages: r.details?.grossWages ?? r.grossWages ?? r.amount ?? 0,
            esiWages: r.details?.esiWages ?? r.esiWages ?? 0,
            esiEmployeeContribution: r.details?.esiEmployeeContribution ?? r.esiEmployeeContribution ?? 0,
            esiEmployerContribution: r.details?.esiEmployerContribution ?? r.esiEmployerContribution ?? 0,
            totalESI: r.details?.totalESI ?? r.totalESI ?? r.amount ?? 0,
            daysWorked: r.details?.daysWorked ?? r.daysWorked ?? 0,
            monthYear: r.period ?? r.details?.monthYear ?? r.monthYear ?? '',
          } as ESIRecord));
          setRows(mapped);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    return rows.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ipNumber.includes(searchTerm);
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, selectedDepartment, rows]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalStats = useMemo(() => {
    return filteredRecords.reduce((acc, record) => ({
      employees: acc.employees + 1,
      totalGrossWages: acc.totalGrossWages + record.grossWages,
      totalESIWages: acc.totalESIWages + record.esiWages,
      totalEmployeeESI: acc.totalEmployeeESI + record.esiEmployeeContribution,
      totalEmployerESI: acc.totalEmployerESI + record.esiEmployerContribution,
      totalESI: acc.totalESI + record.totalESI
    }), { employees: 0, totalGrossWages: 0, totalESIWages: 0, totalEmployeeESI: 0, totalEmployerESI: 0, totalESI: 0 });
  }, [filteredRecords]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">ESI Report</h1>
        <p className="text-sm text-gray-600 mt-1">Employee State Insurance contribution report</p>
        {isLoading && <div className="text-sm text-gray-500 mt-1">Loading…</div>}
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg shadow-sm border border-red-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
            <p className="text-sm text-gray-600 mt-1">ESI Contribution for the Month</p>
            <p className="text-xs text-gray-500 mt-1">Due Date: 21-Dec-2025 (21st of following month)</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              ESI Challan
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
                <p className="text-xs font-medium text-gray-600">ESI Wages</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalESIWages)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employee ESI (0.75%)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalEmployeeESI)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employer ESI (3.0%)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalEmployerESI)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total ESI (3.75%)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalESI)}</p>
              </div>
              <Heart className="h-6 w-6 text-pink-600" />
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
              placeholder="Search by employee name, ID or IP number..."
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

      <div className="space-y-2">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{record.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {record.employeeId}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-700">
                    IP: {record.ipNumber}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Days Worked: {record.daysWorked}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total ESI Contribution</p>
                <p className="text-2xl font-bold text-pink-600">{formatCurrency(record.totalESI)}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {record.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">Wage Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Gross Wages</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.grossWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">ESI Ceiling</span>
                    <span className="font-medium text-blue-900">₹21,000</span>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-blue-900">ESI Wages</span>
                      <span className="font-bold text-blue-900">{formatCurrency(record.esiWages)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-700 mt-2">
                    Status: {record.grossWages <= 21000 ? 'ESI Applicable' : 'Above Ceiling'}
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">Employee Contribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">ESI Wages</span>
                    <span className="font-medium text-orange-900">{formatCurrency(record.esiWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Rate</span>
                    <span className="font-medium text-orange-900">0.75%</span>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-orange-900">Employee ESI</span>
                      <span className="font-bold text-orange-900">{formatCurrency(record.esiEmployeeContribution)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-orange-700 mt-2">
                    Deducted from salary
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h4 className="text-xs font-semibold text-red-900 mb-3">Employer Contribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">ESI Wages</span>
                    <span className="font-medium text-red-900">{formatCurrency(record.esiWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">Rate</span>
                    <span className="font-medium text-red-900">3.0%</span>
                  </div>
                  <div className="pt-2 border-t border-red-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-red-900">Employer ESI</span>
                      <span className="font-bold text-red-900">{formatCurrency(record.esiEmployerContribution)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-red-700 mt-2">
                    Employer's expense
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <h4 className="text-xs font-semibold text-pink-900 mb-3">Total ESI</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-700">Employee Share</span>
                    <span className="font-medium text-pink-900">{formatCurrency(record.esiEmployeeContribution)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-700">Employer Share</span>
                    <span className="font-medium text-pink-900">{formatCurrency(record.esiEmployerContribution)}</span>
                  </div>
                  <div className="pt-2 border-t border-pink-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-pink-900">Total ESI</span>
                      <span className="font-bold text-pink-900">{formatCurrency(record.totalESI)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-pink-700">
                    Payable to ESIC
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-red-900 mb-2">ESI Contribution Guidelines</h3>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• <strong>Applicability:</strong> Employees earning ₹21,000 or less per month</li>
          <li>• <strong>Employee Contribution:</strong> 0.75% of wages (deducted from salary)</li>
          <li>• <strong>Employer Contribution:</strong> 3.0% of wages (employer's expense)</li>
          <li>• <strong>Total Contribution:</strong> 3.75% of wages (0.75% + 3.0%)</li>
          <li>• <strong>Wage Ceiling:</strong> Maximum ₹21,000 per month for contribution calculation</li>
          <li>• <strong>IP Number:</strong> Insurance Person (IP) number unique for each employee</li>
          <li>• <strong>Due Date:</strong> 21st of following month (e.g., Nov salary ESI due 21st Dec)</li>
          <li>• <strong>Payment:</strong> Online payment through ESIC portal with challan generation</li>
          <li>• <strong>Return Filing:</strong> Half-yearly returns to be filed online</li>
          <li>• <strong>Benefits:</strong> Medical care, sickness benefit, maternity benefit, disablement benefit, etc.</li>
        </ul>
      </div>
    </div>
  );
}
