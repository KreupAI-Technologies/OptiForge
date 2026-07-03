'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Download, Users, DollarSign, Shield, Calendar } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface PFRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  uanNumber?: string;
  ipNumber?: string;
  designation: string;
  department: string;
  grossWages: number;
  pfWages: number;
  employeePF: number;
  employerEPF: number;
  employerEPS: number;
  edli: number;
  adminCharges: number;
  totalPF: number;
  daysWorked: number;
  monthYear: string;
}

export default function PFReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');

  const mockPFRecords: PFRecord[] = [
    {
      id: 'PF-2025-11-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      uanNumber: '100123456789',
      designation: 'Senior Production Manager',
      department: 'Production',
      grossWages: 49725,
      pfWages: 20000,
      employeePF: 2400,
      employerEPF: 879,
      employerEPS: 1250,
      edli: 60,
      adminCharges: 60,
      totalPF: 4649,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'PF-2025-11-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      ipNumber: '100234567890',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      grossWages: 35976,
      pfWages: 14500,
      employeePF: 1740,
      employerEPF: 637,
      employerEPS: 906,
      edli: 43,
      adminCharges: 43,
      totalPF: 3369,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'PF-2025-11-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      uanNumber: '100345678901',
      designation: 'Production Operator',
      department: 'Production',
      grossWages: 21874,
      pfWages: 8800,
      employeePF: 1056,
      employerEPF: 387,
      employerEPS: 550,
      edli: 26,
      adminCharges: 26,
      totalPF: 2045,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'PF-2025-11-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      uanNumber: '100456789012',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      grossWages: 34101,
      pfWages: 13725,
      employeePF: 1647,
      employerEPF: 603,
      employerEPS: 858,
      edli: 41,
      adminCharges: 41,
      totalPF: 3190,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'PF-2025-11-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      uanNumber: '100567890123',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      grossWages: 31600,
      pfWages: 12720,
      employeePF: 1526,
      employerEPF: 559,
      employerEPS: 795,
      edli: 38,
      adminCharges: 38,
      totalPF: 2956,
      daysWorked: 30,
      monthYear: 'November 2025'
    },
    {
      id: 'PF-2025-11-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      uanNumber: '100678901234',
      designation: 'HR Executive',
      department: 'HR',
      grossWages: 32849,
      pfWages: 13220,
      employeePF: 1586,
      employerEPF: 581,
      employerEPS: 826,
      edli: 40,
      adminCharges: 40,
      totalPF: 3073,
      daysWorked: 30,
      monthYear: 'November 2025'
    }
  ];

  const [rows, setRows] = useState<PFRecord[]>(mockPFRecords);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getReports('pf');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.details?.employeeId ?? r.employeeCode ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            uanNumber: r.details?.uanNumber ?? r.uanNumber,
            ipNumber: r.details?.ipNumber ?? r.ipNumber,
            designation: r.details?.designation ?? r.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            grossWages: r.details?.grossWages ?? r.grossWages ?? r.amount ?? 0,
            pfWages: r.details?.pfWages ?? r.pfWages ?? 0,
            employeePF: r.details?.employeePF ?? r.employeePF ?? 0,
            employerEPF: r.details?.employerEPF ?? r.employerEPF ?? 0,
            employerEPS: r.details?.employerEPS ?? r.employerEPS ?? 0,
            edli: r.details?.edli ?? r.edli ?? 0,
            adminCharges: r.details?.adminCharges ?? r.adminCharges ?? 0,
            totalPF: r.details?.totalPF ?? r.totalPF ?? r.amount ?? 0,
            daysWorked: r.details?.daysWorked ?? r.daysWorked ?? 0,
            monthYear: r.period ?? r.details?.monthYear ?? r.monthYear ?? '',
          } as PFRecord));
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
        record.uanNumber || record.ipNumber || "".includes(searchTerm);
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
      totalPFWages: acc.totalPFWages + record.pfWages,
      totalEmployeePF: acc.totalEmployeePF + record.employeePF,
      totalEmployerEPF: acc.totalEmployerEPF + record.employerEPF,
      totalEmployerEPS: acc.totalEmployerEPS + record.employerEPS,
      totalEDLI: acc.totalEDLI + record.edli,
      totalAdmin: acc.totalAdmin + record.adminCharges,
      totalPF: acc.totalPF + record.totalPF
    }), {
      employees: 0,
      totalGrossWages: 0,
      totalPFWages: 0,
      totalEmployeePF: 0,
      totalEmployerEPF: 0,
      totalEmployerEPS: 0,
      totalEDLI: 0,
      totalAdmin: 0,
      totalPF: 0
    });
  }, [filteredRecords]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">PF Report</h1>
        <p className="text-sm text-gray-600 mt-1">Provident Fund contribution report</p>
        {isLoading && <div className="text-sm text-gray-500 mt-1">Loading…</div>}
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-sm border border-blue-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
            <p className="text-sm text-gray-600 mt-1">PF Contribution for the Month</p>
            <p className="text-xs text-gray-500 mt-1">Due Date: 15-Dec-2025 (15th of following month)</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              ECR File
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.employees}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">PF Wages</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalPFWages)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employee PF</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalEmployeePF)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employer EPF</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalEmployerEPF)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employer EPS</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalEmployerEPS)}</p>
              </div>
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total PF</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalPF)}</p>
              </div>
              <FileText className="h-6 w-6 text-cyan-600" />
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
              placeholder="Search by employee name, ID or UAN number..."
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
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    UAN: {record.uanNumber || record.ipNumber || ""}
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
                <p className="text-xs text-gray-500 mb-1">Total PF Contribution</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(record.totalPF)}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {record.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">Wage Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Gross Wages</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.grossWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">PF Ceiling</span>
                    <span className="font-medium text-green-900">₹15,000</span>
                  </div>
                  <div className="pt-2 border-t border-green-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-green-900">PF Wages</span>
                      <span className="font-bold text-green-900">{formatCurrency(record.pfWages)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">Employee Share</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">PF Wages</span>
                    <span className="font-medium text-orange-900">{formatCurrency(record.pfWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Rate</span>
                    <span className="font-medium text-orange-900">12%</span>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-orange-900">Employee PF</span>
                      <span className="font-bold text-orange-900">{formatCurrency(record.employeePF)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-orange-700 mt-2">
                    Deducted from salary
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">Employer EPF</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">PF Wages</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.pfWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Rate</span>
                    <span className="font-medium text-blue-900">3.67%</span>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-blue-900">Employer EPF</span>
                      <span className="font-bold text-blue-900">{formatCurrency(record.employerEPF)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-700 mt-2">
                    To EPF account
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-3">Employer EPS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">PF Wages</span>
                    <span className="font-medium text-purple-900">{formatCurrency(record.pfWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">Rate</span>
                    <span className="font-medium text-purple-900">8.33%</span>
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-purple-900">Employer EPS</span>
                      <span className="font-bold text-purple-900">{formatCurrency(record.employerEPS)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-purple-700 mt-2">
                    To EPS account
                  </div>
                </div>
              </div>

              <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                <h4 className="text-xs font-semibold text-cyan-900 mb-3">Other Charges</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-cyan-700">EDLI (0.5%)</span>
                    <span className="font-medium text-cyan-900">{formatCurrency(record.edli)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-cyan-700">Admin (0.5%)</span>
                    <span className="font-medium text-cyan-900">{formatCurrency(record.adminCharges)}</span>
                  </div>
                  <div className="pt-2 border-t border-cyan-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-cyan-900">Total PF</span>
                      <span className="font-bold text-cyan-900">{formatCurrency(record.totalPF)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-cyan-700">
                    Payable to EPFO
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">PF Contribution Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <h4 className="text-xs font-bold text-blue-800 mb-2">Contribution Breakdown (12% + 12% = 24%):</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Employee Share:</strong> 12% of PF wages → Goes to EPF account</li>
              <li>• <strong>Employer EPF:</strong> 3.67% of PF wages → Goes to EPF account</li>
              <li>• <strong>Employer EPS:</strong> 8.33% of PF wages → Goes to EPS account (pension)</li>
              <li>• <strong>EDLI Charges:</strong> 0.5% of PF wages → Insurance scheme</li>
              <li>• <strong>Admin Charges:</strong> 0.5% of PF wages → Administration costs</li>
              <li>• <strong>Total Employer:</strong> 12% + 0.5% + 0.5% = 13%</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-800 mb-2">Important Points:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>PF Ceiling:</strong> Maximum ₹15,000 per month for contribution calculation</li>
              <li>• <strong>UAN:</strong> Universal Account Number - portable across employers</li>
              <li>• <strong>Due Date:</strong> 15th of following month (e.g., Nov salary PF due 15th Dec)</li>
              <li>• <strong>ECR:</strong> Electronic Challan cum Return to be filed monthly</li>
              <li>• <strong>Payment:</strong> Online through EPFO portal with ECR upload</li>
              <li>• <strong>Withdrawal:</strong> Allowed on retirement, resignation (conditions apply)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
