'use client';

import { useState, useMemo, useEffect } from 'react';
import { Receipt, Search, Download, Users, DollarSign, FileText, Calendar, TrendingUp } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface TDSRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  panNumber: string;
  designation: string;
  department: string;
  grossSalary: number;
  standardDeduction: number;
  professionalTax: number;
  pfEmployee: number;
  taxableIncome: number;
  monthlyTDS: number;
  tdsDeductedTillDate: number;
  projectedAnnualIncome: number;
  taxRegime: 'old' | 'new';
  monthYear: string;
}

export default function TDSReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [selectedRegime, setSelectedRegime] = useState('all');

  const mockTDSRecords: TDSRecord[] = [
    {
      id: 'TDS-2025-11-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      panNumber: 'ABCDE1234F',
      designation: 'Senior Production Manager',
      department: 'Production',
      grossSalary: 49725,
      standardDeduction: 4167,
      professionalTax: 200,
      pfEmployee: 2400,
      taxableIncome: 42958,
      monthlyTDS: 1250,
      tdsDeductedTillDate: 10000,
      projectedAnnualIncome: 515496,
      taxRegime: 'new',
      monthYear: 'November 2025'
    },
    {
      id: 'TDS-2025-11-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      panNumber: 'FGHIJ5678K',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      grossSalary: 35976,
      standardDeduction: 4167,
      professionalTax: 200,
      pfEmployee: 1740,
      taxableIncome: 29869,
      monthlyTDS: 450,
      tdsDeductedTillDate: 3600,
      projectedAnnualIncome: 358428,
      taxRegime: 'old',
      monthYear: 'November 2025'
    },
    {
      id: 'TDS-2025-11-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      panNumber: 'LMNOP9012Q',
      designation: 'Production Operator',
      department: 'Production',
      grossSalary: 21874,
      standardDeduction: 4167,
      professionalTax: 200,
      pfEmployee: 1056,
      taxableIncome: 16451,
      monthlyTDS: 0,
      tdsDeductedTillDate: 0,
      projectedAnnualIncome: 197412,
      taxRegime: 'new',
      monthYear: 'November 2025'
    },
    {
      id: 'TDS-2025-11-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      panNumber: 'RSTUV3456W',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      grossSalary: 34101,
      standardDeduction: 4167,
      professionalTax: 200,
      pfEmployee: 1647,
      taxableIncome: 28087,
      monthlyTDS: 380,
      tdsDeductedTillDate: 3040,
      projectedAnnualIncome: 337044,
      taxRegime: 'new',
      monthYear: 'November 2025'
    },
    {
      id: 'TDS-2025-11-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      panNumber: 'XYZAB7890C',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      grossSalary: 31600,
      standardDeduction: 4167,
      professionalTax: 200,
      pfEmployee: 1526,
      taxableIncome: 25707,
      monthlyTDS: 320,
      tdsDeductedTillDate: 2560,
      projectedAnnualIncome: 308484,
      taxRegime: 'old',
      monthYear: 'November 2025'
    },
    {
      id: 'TDS-2025-11-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      panNumber: 'DEFGH2345I',
      designation: 'HR Executive',
      department: 'HR',
      grossSalary: 32849,
      standardDeduction: 4167,
      professionalTax: 200,
      pfEmployee: 1586,
      taxableIncome: 26896,
      monthlyTDS: 350,
      tdsDeductedTillDate: 2800,
      projectedAnnualIncome: 322752,
      taxRegime: 'new',
      monthYear: 'November 2025'
    }
  ];

  const [rows, setRows] = useState<TDSRecord[]>(mockTDSRecords);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getReports('tds');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.details?.employeeId ?? r.employeeCode ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            panNumber: r.details?.panNumber ?? r.panNumber ?? '',
            designation: r.details?.designation ?? r.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            grossSalary: r.details?.grossSalary ?? r.grossSalary ?? r.amount ?? 0,
            standardDeduction: r.details?.standardDeduction ?? r.standardDeduction ?? 0,
            professionalTax: r.details?.professionalTax ?? r.professionalTax ?? 0,
            pfEmployee: r.details?.pfEmployee ?? r.pfEmployee ?? 0,
            taxableIncome: r.details?.taxableIncome ?? r.taxableIncome ?? 0,
            monthlyTDS: r.details?.monthlyTDS ?? r.monthlyTDS ?? r.amount ?? 0,
            tdsDeductedTillDate: r.details?.tdsDeductedTillDate ?? r.tdsDeductedTillDate ?? 0,
            projectedAnnualIncome: r.details?.projectedAnnualIncome ?? r.projectedAnnualIncome ?? 0,
            taxRegime: r.details?.taxRegime ?? r.taxRegime ?? 'new',
            monthYear: r.period ?? r.details?.monthYear ?? r.monthYear ?? '',
          } as TDSRecord));
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
        record.panNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesRegime = selectedRegime === 'all' || record.taxRegime === selectedRegime;
      return matchesSearch && matchesDepartment && matchesRegime;
    });
  }, [searchTerm, selectedDepartment, selectedRegime, rows]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const regimes = ['all', 'old', 'new'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalStats = useMemo(() => {
    return filteredRecords.reduce((acc, record) => ({
      employees: acc.employees + 1,
      totalGrossSalary: acc.totalGrossSalary + record.grossSalary,
      totalTaxableIncome: acc.totalTaxableIncome + record.taxableIncome,
      totalMonthlyTDS: acc.totalMonthlyTDS + record.monthlyTDS,
      totalTDSTillDate: acc.totalTDSTillDate + record.tdsDeductedTillDate,
      oldRegime: acc.oldRegime + (record.taxRegime === 'old' ? 1 : 0),
      newRegime: acc.newRegime + (record.taxRegime === 'new' ? 1 : 0)
    }), {
      employees: 0,
      totalGrossSalary: 0,
      totalTaxableIncome: 0,
      totalMonthlyTDS: 0,
      totalTDSTillDate: 0,
      oldRegime: 0,
      newRegime: 0
    });
  }, [filteredRecords]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">TDS Report</h1>
        <p className="text-sm text-gray-600 mt-1">Tax Deducted at Source monthly report</p>
        {isLoading && <div className="text-sm text-gray-500 mt-1">Loading…</div>}
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm border border-orange-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">November 2025</h2>
            <p className="text-sm text-gray-600 mt-1">TDS Deduction for the Month</p>
            <p className="text-xs text-gray-500 mt-1">Payment Due: 07-Dec-2025 (7th of following month)</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Download className="h-4 w-4" />
              TDS Challan
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
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalGrossSalary)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Taxable Income</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalTaxableIncome)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Monthly TDS</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalMonthlyTDS)}</p>
              </div>
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">TDS Till Date</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalTDSTillDate)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Tax Regime</p>
                <p className="text-sm font-bold text-gray-900 mt-1">Old: {totalStats.oldRegime} | New: {totalStats.newRegime}</p>
              </div>
              <FileText className="h-6 w-6 text-amber-600" />
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
              placeholder="Search by employee name, ID or PAN number..."
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
          <select
            value={selectedRegime}
            onChange={(e) => setSelectedRegime(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {regimes.map(regime => (
              <option key={regime} value={regime}>
                {regime === 'all' ? 'All Regimes' : regime === 'old' ? 'Old Regime' : 'New Regime'}
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
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                    PAN: {record.panNumber}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.taxRegime === 'old' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {record.taxRegime.toUpperCase()} REGIME
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Projected Annual Income: {formatCurrency(record.projectedAnnualIncome)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Monthly TDS</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(record.monthlyTDS)}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {record.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">Salary Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Gross Salary</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Annual Gross</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.grossSalary * 12)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Projected Income</span>
                    <span className="font-medium text-green-900">{formatCurrency(record.projectedAnnualIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Standard Deduction</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">PF (Employee)</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.pfEmployee)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Professional Tax</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.professionalTax)}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-blue-900">Total Deductions</span>
                      <span className="font-bold text-blue-900">
                        {formatCurrency(record.standardDeduction + record.pfEmployee + record.professionalTax)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">Taxable Income</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Gross Salary</span>
                    <span className="font-medium text-orange-900">{formatCurrency(record.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Less: Deductions</span>
                    <span className="font-medium text-orange-900">
                      -{formatCurrency(record.standardDeduction + record.pfEmployee + record.professionalTax)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-orange-900">Taxable Income</span>
                      <span className="font-bold text-orange-900">{formatCurrency(record.taxableIncome)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Annual Taxable</span>
                    <span className="font-medium text-orange-900">{formatCurrency(record.taxableIncome * 12)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h4 className="text-xs font-semibold text-red-900 mb-3">TDS Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">Tax Regime</span>
                    <span className="font-medium text-red-900 uppercase">{record.taxRegime}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">Monthly TDS</span>
                    <span className="font-medium text-red-900">{formatCurrency(record.monthlyTDS)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">Estimated Annual TDS</span>
                    <span className="font-medium text-red-900">{formatCurrency(record.monthlyTDS * 12)}</span>
                  </div>
                  <div className="text-xs text-red-700 mt-2">
                    {record.monthlyTDS === 0 ? 'Below taxable limit' : 'TDS applicable'}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-3">YTD Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">TDS Till Date</span>
                    <span className="font-medium text-purple-900">{formatCurrency(record.tdsDeductedTillDate)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">Current Month</span>
                    <span className="font-medium text-purple-900">{formatCurrency(record.monthlyTDS)}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-purple-900">Total TDS</span>
                      <span className="font-bold text-purple-900">
                        {formatCurrency(record.tdsDeductedTillDate + record.monthlyTDS)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-purple-700 mt-2">
                    Month: {record.monthYear}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">TDS Deduction Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <h4 className="text-xs font-bold text-orange-800 mb-2">Old Tax Regime Slabs (FY 2025-26):</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Up to ₹2,50,000: <strong>Nil</strong></li>
              <li>• ₹2,50,001 to ₹5,00,000: <strong>5%</strong></li>
              <li>• ₹5,00,001 to ₹10,00,000: <strong>20%</strong></li>
              <li>• Above ₹10,00,000: <strong>30%</strong></li>
              <li>• <strong>Standard Deduction:</strong> ₹50,000 per annum</li>
              <li>• <strong>Section 80C/80D/etc:</strong> Available for deductions</li>
              <li>• <strong>Rebate u/s 87A:</strong> Up to ₹12,500 (if income ≤ ₹5 lakhs)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-800 mb-2">New Tax Regime Slabs (FY 2025-26):</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Up to ₹3,00,000: <strong>Nil</strong></li>
              <li>• ₹3,00,001 to ₹7,00,000: <strong>5%</strong></li>
              <li>• ₹7,00,001 to ₹10,00,000: <strong>10%</strong></li>
              <li>• ₹10,00,001 to ₹12,00,000: <strong>15%</strong></li>
              <li>• ₹12,00,001 to ₹15,00,000: <strong>20%</strong></li>
              <li>• Above ₹15,00,000: <strong>30%</strong></li>
              <li>• <strong>Standard Deduction:</strong> ₹50,000 per annum</li>
              <li>• <strong>No 80C/80D deductions</strong> (except employer NPS contribution)</li>
              <li>• <strong>Rebate u/s 87A:</strong> Up to ₹25,000 (if income ≤ ₹7 lakhs)</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-xs font-bold text-orange-800 mb-2">Important Points:</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• <strong>Payment Due:</strong> 7th of following month (e.g., Nov salary TDS due 7th Dec)</li>
            <li>• <strong>Challan:</strong> Form 281 (TDS on Salary) via NSDL/TIN portal</li>
            <li>• <strong>Quarterly Return:</strong> Form 24Q to be filed quarterly</li>
            <li>• <strong>Form 16:</strong> TDS certificate to be issued to employees annually</li>
            <li>• <strong>PAN Mandatory:</strong> TDS deduction requires valid PAN of employee</li>
            <li>• <strong>Surcharge & Cess:</strong> 4% Health & Education Cess on total tax (surcharge if applicable)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
