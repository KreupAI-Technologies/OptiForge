'use client';

import { useState, useMemo, useEffect } from 'react';
import { Heart, Search, Download, FileText, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
  generateESIContributionReturn,
  generateESIChallan,
  type ESIContributionMonth as ESIContributionMonthType
} from '@/lib/payroll/esiFileGenerator';

interface EmployeeESIContribution {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  esiNumber: string;
  grossSalary: number;
  esiWages: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  eligible: boolean;
}

interface ESIContributionMonth {
  id: string;
  monthYear: string;
  payPeriod: string;
  employeeCount: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalWages: number;
  totalPayable: number;
  dueDate: string;
  status: 'draft' | 'verified' | 'submitted';
  records: EmployeeESIContribution[];
}

export default function ESIContributionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const mockESIMonth: ESIContributionMonth = {
    id: 'ESI-2025-11',
    monthYear: 'November 2025',
    payPeriod: '01-Nov-2025 to 30-Nov-2025',
    employeeCount: 4,
    totalEmployeeContribution: 1183,
    totalEmployerContribution: 4734,
    totalWages: 157650,
    totalPayable: 5917,
    dueDate: '2025-12-21',
    status: 'verified',
    records: [
      {
        id: 'ESI-001',
        employeeId: 'EMP002',
        employeeName: 'Priya Sharma',
        designation: 'Quality Control Supervisor',
        department: 'Quality',
        esiNumber: 'ESI1234567890',
        grossSalary: 35976,
        esiWages: 35976,
        employeeContribution: 270,
        employerContribution: 1079,
        totalContribution: 1349,
        eligible: true
      },
      {
        id: 'ESI-002',
        employeeId: 'EMP003',
        employeeName: 'Amit Patel',
        designation: 'Production Operator',
        department: 'Production',
        esiNumber: 'ESI1234567891',
        grossSalary: 21874,
        esiWages: 21874,
        employeeContribution: 164,
        employerContribution: 656,
        totalContribution: 820,
        eligible: true
      },
      {
        id: 'ESI-003',
        employeeId: 'EMP004',
        employeeName: 'Neha Singh',
        designation: 'Maintenance Engineer',
        department: 'Maintenance',
        esiNumber: 'ESI1234567892',
        grossSalary: 34101,
        esiWages: 34101,
        employeeContribution: 256,
        employerContribution: 1023,
        totalContribution: 1279,
        eligible: true
      },
      {
        id: 'ESI-004',
        employeeId: 'EMP005',
        employeeName: 'Vikram Desai',
        designation: 'Logistics Coordinator',
        department: 'Logistics',
        esiNumber: 'ESI1234567893',
        grossSalary: 31600,
        esiWages: 31600,
        employeeContribution: 237,
        employerContribution: 948,
        totalContribution: 1185,
        eligible: true
      },
      {
        id: 'ESI-005',
        employeeId: 'EMP006',
        employeeName: 'Kavita Mehta',
        designation: 'HR Executive',
        department: 'HR',
        esiNumber: 'ESI1234567894',
        grossSalary: 32849,
        esiWages: 32849,
        employeeContribution: 246,
        employerContribution: 985,
        totalContribution: 1231,
        eligible: true
      },
      {
        id: 'ESI-006',
        employeeId: 'EMP001',
        employeeName: 'Rajesh Kumar',
        designation: 'Senior Production Manager',
        department: 'Production',
        esiNumber: '',
        grossSalary: 49725,
        esiWages: 0,
        employeeContribution: 0,
        employerContribution: 0,
        totalContribution: 0,
        eligible: false
      }
    ]
  };

  const [records, setRows] = useState<EmployeeESIContribution[]>(mockESIMonth.records);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrPayrollService.getStatutoryFilings('esi-contribution');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.details?.employeeId ?? r.employeeCode ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            designation: r.designation ?? r.details?.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            esiNumber: r.esiNumber ?? r.details?.esiNumber ?? '',
            grossSalary: r.grossSalary ?? r.details?.grossSalary ?? r.amount ?? 0,
            esiWages: r.esiWages ?? r.details?.esiWages ?? 0,
            employeeContribution: r.employeeContribution ?? r.details?.employeeContribution ?? 0,
            employerContribution: r.employerContribution ?? r.details?.employerContribution ?? 0,
            totalContribution: r.totalContribution ?? r.details?.totalContribution ?? r.amount ?? 0,
            eligible: r.eligible ?? r.details?.eligible ?? true,
          } as EmployeeESIContribution));
          setRows(mapped);
        }
      } catch (e) { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load'); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.esiNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [searchTerm, selectedDepartment, records]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  // Handler: Download Return
  const handleDownloadReturn = async () => {
    try {
      await generateESIContributionReturn(mockESIMonth);
      toast({
        title: "Success",
        description: "ESI contribution return downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download return. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler: Generate Challan
  const handleGenerateChallan = async () => {
    try {
      await generateESIChallan(mockESIMonth);
      toast({
        title: "Success",
        description: "ESI challan generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate challan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    verified: 'bg-blue-100 text-blue-700',
    submitted: 'bg-green-100 text-green-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">ESI Contribution</h1>
        <p className="text-sm text-gray-600 mt-1">Monthly Employee State Insurance contribution calculations</p>
        {isLoading && <div className="text-sm text-gray-500">Loading…</div>}
        {loadError && <div className="text-sm text-red-600">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg shadow-sm border border-pink-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{mockESIMonth.monthYear}</h2>
            <p className="text-sm text-gray-600 mt-1">Pay Period: {mockESIMonth.payPeriod}</p>
            <p className="text-xs text-gray-500 mt-1">ESI Month ID: {mockESIMonth.id}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[mockESIMonth.status]} block mb-2`}>
              {mockESIMonth.status.toUpperCase()}
            </span>
            <p className="text-xs text-gray-600">
              Due Date: {new Date(mockESIMonth.dueDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Covered Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockESIMonth.employeeCount}</p>
              </div>
              <Users className="h-6 w-6 text-pink-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employee Share</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(mockESIMonth.totalEmployeeContribution)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employer Share</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(mockESIMonth.totalEmployerContribution)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Payable</p>
                <p className="text-lg font-bold text-pink-900 mt-1">{formatCurrency(mockESIMonth.totalPayable)}</p>
              </div>
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-1">Total ESI Wages</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(mockESIMonth.totalWages)}</p>
          <p className="text-xs text-blue-700 mt-1">Gross wages for ESI eligible employees</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-medium text-green-600 mb-1">Employee Rate</p>
          <p className="text-xl font-bold text-green-900">0.75%</p>
          <p className="text-xs text-green-700 mt-1">Deducted from employee salary</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-xs font-medium text-purple-600 mb-1">Employer Rate</p>
          <p className="text-xl font-bold text-purple-900">3.0%</p>
          <p className="text-xs text-purple-700 mt-1">Employer contribution</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or ESI number..."
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
          <button
            onClick={handleDownloadReturn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download Return
          </button>
          <button
            onClick={handleGenerateChallan}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText className="h-4 w-4" />
            ESI Challan
          </button>
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
                  {!record.eligible && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      NOT ELIGIBLE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department}
                </p>
                {record.esiNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    ESI Number: {record.esiNumber}
                  </p>
                )}
                {!record.eligible && (
                  <p className="text-xs text-red-600 mt-1">
                    Gross salary exceeds ESI wage limit (₹21,000/month)
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Contribution</p>
                <p className="text-2xl font-bold text-pink-600">{formatCurrency(record.totalContribution)}</p>
              </div>
            </div>

            {record.eligible && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 mb-3">Salary Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Gross Salary</span>
                      <span className="font-medium text-gray-900">{formatCurrency(record.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">ESI Wages</span>
                      <span className="font-medium text-gray-900">{formatCurrency(record.esiWages)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">Employee Share</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Rate</span>
                      <span className="font-medium text-green-900">0.75%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Amount</span>
                      <span className="font-medium text-green-900">{formatCurrency(record.employeeContribution)}</span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-green-900">Total</span>
                        <span className="font-bold text-green-900">{formatCurrency(record.employeeContribution)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Employer Share</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Rate</span>
                      <span className="font-medium text-purple-900">3.0%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">Amount</span>
                      <span className="font-medium text-purple-900">{formatCurrency(record.employerContribution)}</span>
                    </div>
                    <div className="pt-2 border-t border-purple-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-purple-900">Total</span>
                        <span className="font-bold text-purple-900">{formatCurrency(record.employerContribution)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                  <h4 className="text-xs font-semibold text-pink-900 mb-3">Combined Total</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-pink-700">Employee</span>
                      <span className="font-medium text-pink-900">{formatCurrency(record.employeeContribution)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-pink-700">Employer</span>
                      <span className="font-medium text-pink-900">{formatCurrency(record.employerContribution)}</span>
                    </div>
                    <div className="pt-2 border-t border-pink-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-pink-900">Total</span>
                        <span className="font-bold text-pink-900">{formatCurrency(record.totalContribution)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-pink-900 mb-2">ESI Contribution Guidelines (India)</h3>
        <ul className="text-sm text-pink-800 space-y-1">
          <li>• <strong>Eligibility:</strong> Employees earning up to ₹21,000/month gross salary</li>
          <li>• <strong>Employee Contribution:</strong> 0.75% of gross wages (deducted from salary)</li>
          <li>• <strong>Employer Contribution:</strong> 3.0% of gross wages</li>
          <li>• <strong>Total Contribution:</strong> 3.75% of gross wages (0.75% + 3.0%)</li>
          <li>• <strong>Due Date:</strong> 21st of the following month</li>
          <li>• <strong>Benefits:</strong> Medical, sickness, maternity, disablement, and dependent benefits</li>
          <li>• <strong>Coverage:</strong> Once covered, remains ESI member even if salary exceeds limit</li>
          <li>• <strong>ESI Returns:</strong> Half-yearly returns to be filed online</li>
        </ul>
      </div>
    </div>
  );
}
