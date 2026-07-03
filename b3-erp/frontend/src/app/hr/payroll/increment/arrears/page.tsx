'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calculator, Search, Calendar, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface IncrementArrears {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  effectiveDate: string;
  implementationDate: string;
  arrearMonths: number;
  oldBasic: number;
  newBasic: number;
  incrementAmount: number;
  monthlyDifference: number;
  totalArrears: number;
  pfArrears: number;
  esiArrears: number;
  netArrears: number;
  status: 'calculated' | 'approved' | 'processed' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
  paymentDate?: string;
  remarks?: string;
}

export default function IncrementArrearsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const mockArrears: IncrementArrears[] = [
    {
      id: 'ARR-2025-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      effectiveDate: '2025-04-01',
      implementationDate: '2025-07-01',
      arrearMonths: 3,
      oldBasic: 20000,
      newBasic: 22400,
      incrementAmount: 2400,
      monthlyDifference: 2400,
      totalArrears: 7200,
      pfArrears: 864,
      esiArrears: 0,
      netArrears: 6336,
      status: 'paid',
      approvedBy: 'HR Manager',
      approvedDate: '2025-06-25',
      paymentDate: '2025-07-01'
    },
    {
      id: 'ARR-2025-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      effectiveDate: '2025-04-01',
      implementationDate: '2025-08-01',
      arrearMonths: 4,
      oldBasic: 14500,
      newBasic: 15950,
      incrementAmount: 1450,
      monthlyDifference: 1450,
      totalArrears: 5800,
      pfArrears: 696,
      esiArrears: 43,
      netArrears: 5061,
      status: 'approved',
      approvedBy: 'HR Manager',
      approvedDate: '2025-07-28'
    },
    {
      id: 'ARR-2025-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Production Operator',
      department: 'Production',
      effectiveDate: '2025-04-01',
      implementationDate: '2025-06-01',
      arrearMonths: 2,
      oldBasic: 8800,
      newBasic: 9592,
      incrementAmount: 792,
      monthlyDifference: 792,
      totalArrears: 1584,
      pfArrears: 190,
      esiArrears: 12,
      netArrears: 1382,
      status: 'paid',
      approvedBy: 'HR Manager',
      approvedDate: '2025-05-28',
      paymentDate: '2025-06-01'
    },
    {
      id: 'ARR-2025-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      effectiveDate: '2025-04-01',
      implementationDate: '2025-09-01',
      arrearMonths: 5,
      oldBasic: 13725,
      newBasic: 15097,
      incrementAmount: 1372,
      monthlyDifference: 1372,
      totalArrears: 6860,
      pfArrears: 823,
      esiArrears: 51,
      netArrears: 5986,
      status: 'calculated',
      approvedBy: undefined,
      approvedDate: undefined
    },
    {
      id: 'ARR-2025-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      effectiveDate: '2025-04-01',
      implementationDate: '2025-07-01',
      arrearMonths: 3,
      oldBasic: 12720,
      newBasic: 13965,
      incrementAmount: 1245,
      monthlyDifference: 1245,
      totalArrears: 3735,
      pfArrears: 448,
      esiArrears: 28,
      netArrears: 3259,
      status: 'processed',
      approvedBy: 'HR Manager',
      approvedDate: '2025-06-28'
    },
    {
      id: 'ARR-2025-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      designation: 'HR Executive',
      department: 'HR',
      effectiveDate: '2025-04-01',
      implementationDate: '2025-08-01',
      arrearMonths: 4,
      oldBasic: 13220,
      newBasic: 14542,
      incrementAmount: 1322,
      monthlyDifference: 1322,
      totalArrears: 5288,
      pfArrears: 635,
      esiArrears: 40,
      netArrears: 4613,
      status: 'approved',
      approvedBy: 'HR Manager',
      approvedDate: '2025-07-30'
    }
  ];

  const [rows, setRows] = useState<IncrementArrears[]>(mockArrears);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getSalaryRevisions('increment-arrears');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.employeeCode ?? r.details?.employeeId ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            designation: r.designation ?? r.details?.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            effectiveDate: r.effectiveDate ?? r.details?.effectiveDate ?? '',
            implementationDate: r.implementationDate ?? r.details?.implementationDate ?? '',
            arrearMonths: r.arrearMonths ?? r.details?.arrearMonths ?? 0,
            oldBasic: r.currentSalary ?? r.oldBasic ?? r.details?.oldBasic ?? 0,
            newBasic: r.revisedSalary ?? r.newBasic ?? r.details?.newBasic ?? 0,
            incrementAmount: r.incrementAmount ?? r.details?.incrementAmount ?? 0,
            monthlyDifference: r.monthlyDifference ?? r.details?.monthlyDifference ?? 0,
            totalArrears: r.totalArrears ?? r.details?.totalArrears ?? 0,
            pfArrears: r.pfArrears ?? r.details?.pfArrears ?? 0,
            esiArrears: r.esiArrears ?? r.details?.esiArrears ?? 0,
            netArrears: r.netArrears ?? r.details?.netArrears ?? 0,
            status: (r.status ?? r.details?.status ?? 'calculated') as IncrementArrears['status'],
            approvedBy: r.approvedBy ?? r.details?.approvedBy ?? undefined,
            approvedDate: r.approvedDate ?? r.details?.approvedDate ?? undefined,
            paymentDate: r.paymentDate ?? r.details?.paymentDate ?? undefined,
            remarks: r.remarks ?? r.details?.remarks ?? undefined,
          } as IncrementArrears));
          setRows(mapped);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredArrears = useMemo(() => {
    return rows.filter(arr => {
      const matchesSearch =
        arr.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        arr.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || arr.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || arr.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [rows, searchTerm, selectedDepartment, selectedStatus]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'calculated', 'approved', 'processed', 'paid'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    calculated: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    processed: 'bg-purple-100 text-purple-700',
    paid: 'bg-teal-100 text-teal-700'
  };

  const totalStats = useMemo(() => {
    return filteredArrears.reduce((acc, arr) => ({
      employees: acc.employees + 1,
      totalArrears: acc.totalArrears + arr.totalArrears,
      totalPFArrears: acc.totalPFArrears + arr.pfArrears,
      totalESIArrears: acc.totalESIArrears + arr.esiArrears,
      netArrears: acc.netArrears + arr.netArrears,
      paid: acc.paid + (arr.status === 'paid' ? 1 : 0),
      approved: acc.approved + (arr.status === 'approved' ? 1 : 0)
    }), { employees: 0, totalArrears: 0, totalPFArrears: 0, totalESIArrears: 0, netArrears: 0, paid: 0, approved: 0 });
  }, [filteredArrears]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Increment Arrears</h1>
        <p className="text-sm text-gray-600 mt-1">Backpay calculation for delayed increment implementation</p>
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm border border-orange-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">FY 2025-26 Arrears</h2>
            <p className="text-sm text-gray-600 mt-1">Arrears for delayed annual increment implementation</p>
            <p className="text-xs text-gray-500 mt-1">Effective Date: 01-Apr-2025</p>
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
                <p className="text-xs font-medium text-gray-600">Total Arrears</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalArrears)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">PF Arrears</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.totalPFArrears)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Net Arrears</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalStats.netArrears)}</p>
              </div>
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.approved}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.paid}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-teal-600" />
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
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredArrears.map(arr => (
          <div key={arr.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{arr.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {arr.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[arr.status]}`}>
                    {arr.status.toUpperCase()}
                  </span>
                  {arr.arrearMonths > 0 && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {arr.arrearMonths} MONTHS DELAY
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {arr.designation} • {arr.department}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Effective: {new Date(arr.effectiveDate).toLocaleDateString('en-IN')} • Implemented: {new Date(arr.implementationDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Net Arrears</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(arr.netArrears)}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {arr.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Salary Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Old Basic</span>
                    <span className="font-medium text-gray-900">{formatCurrency(arr.oldBasic)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">New Basic</span>
                    <span className="font-medium text-gray-900">{formatCurrency(arr.newBasic)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-green-900">Monthly Difference</span>
                      <span className="font-bold text-green-900">{formatCurrency(arr.monthlyDifference)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">Delay Period</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Effective Date</span>
                    <span className="font-medium text-orange-900">{new Date(arr.effectiveDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Implementation</span>
                    <span className="font-medium text-orange-900">{new Date(arr.implementationDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-orange-900">Arrear Months</span>
                      <span className="font-bold text-orange-900">{arr.arrearMonths} months</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <h4 className="text-xs font-semibold text-amber-900 mb-3">Arrears Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-700">Monthly Diff</span>
                    <span className="font-medium text-amber-900">{formatCurrency(arr.monthlyDifference)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-700">Months</span>
                    <span className="font-medium text-amber-900">× {arr.arrearMonths}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-amber-900">Total Arrears</span>
                      <span className="font-bold text-amber-900">{formatCurrency(arr.totalArrears)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h4 className="text-xs font-semibold text-red-900 mb-3">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">PF Arrears (12%)</span>
                    <span className="font-medium text-red-900">{formatCurrency(arr.pfArrears)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-700">ESI Arrears</span>
                    <span className="font-medium text-red-900">{formatCurrency(arr.esiArrears)}</span>
                  </div>
                  <div className="pt-2 border-t border-red-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-red-900">Total Deductions</span>
                      <span className="font-bold text-red-900">{formatCurrency(arr.pfArrears + arr.esiArrears)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">Net Payment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Total Arrears</span>
                    <span className="font-medium text-green-900">{formatCurrency(arr.totalArrears)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Less: Deductions</span>
                    <span className="font-medium text-green-900">-{formatCurrency(arr.pfArrears + arr.esiArrears)}</span>
                  </div>
                  <div className="pt-2 border-t border-green-300">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-green-900">Net Arrears</span>
                      <span className="font-bold text-green-900">{formatCurrency(arr.netArrears)}</span>
                    </div>
                  </div>
                  {arr.paymentDate && (
                    <div className="text-xs text-green-700 mt-2">
                      Paid: {new Date(arr.paymentDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {arr.approvedBy && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div>
                    <span className="font-semibold">Approved by:</span> {arr.approvedBy} on {arr.approvedDate && new Date(arr.approvedDate).toLocaleDateString('en-IN')}
                  </div>
                  {arr.remarks && (
                    <span className="italic">{arr.remarks}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">Arrears Payment Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <h4 className="text-xs font-bold text-orange-800 mb-2">Calculation Method:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• <strong>Arrears Period:</strong> From effective date to implementation date</li>
              <li>• <strong>Monthly Difference:</strong> New Basic - Old Basic</li>
              <li>• <strong>Gross Arrears:</strong> Monthly Difference × Number of Months</li>
              <li>• <strong>PF on Arrears:</strong> 12% of gross arrears (employee contribution)</li>
              <li>• <strong>ESI on Arrears:</strong> 0.75% if applicable (based on wage ceiling)</li>
              <li>• <strong>Net Arrears:</strong> Gross Arrears - PF - ESI</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-800 mb-2">Important Points:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• <strong>Payment:</strong> Arrears paid with next salary or separate payment</li>
              <li>• <strong>PF Contribution:</strong> Both employee and employer PF calculated on arrears</li>
              <li>• <strong>TDS Treatment:</strong> Arrears may attract higher TDS as per IT rules</li>
              <li>• <strong>Approval:</strong> Requires HR and Finance approval before payment</li>
              <li>• <strong>Timeline:</strong> Process within 30 days of increment approval</li>
              <li>• <strong>Documentation:</strong> Maintain arrears calculation sheet for audit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
