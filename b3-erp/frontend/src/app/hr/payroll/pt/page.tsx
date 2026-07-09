'use client';

import { useState, useMemo, useEffect } from 'react';
import { Receipt, Search, Download, FileText, Users, DollarSign, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface EmployeePT {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  state: string;
  grossSalary: number;
  ptSlab: string;
  ptAmount: number;
  ptApplicable: boolean;
}

interface PTMonth {
  id: string;
  monthYear: string;
  payPeriod: string;
  state: string;
  employeeCount: number;
  totalPTCollected: number;
  dueDate: string;
  status: 'draft' | 'verified' | 'paid';
  records: EmployeePT[];
}

export default function ProfessionalTaxPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  const [records, setRecords] = useState<EmployeePT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Summary object derived from the real fetched records
  const ptMonth: PTMonth = {
    id: 'PT-2025-11',
    monthYear: 'November 2025',
    payPeriod: '01-Nov-2025 to 30-Nov-2025',
    state: records[0]?.state ?? 'Karnataka',
    employeeCount: records.filter(r => r.ptApplicable).length,
    totalPTCollected: records.reduce((s, r) => s + r.ptAmount, 0),
    dueDate: '2025-12-20',
    status: 'verified',
    records,
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getStatutoryFilings('pt');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped: EmployeePT[] = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.employeeCode ?? '',
            employeeName: r.employeeName ?? '',
            designation: r.details?.designation ?? '',
            department: r.department ?? '',
            state: r.details?.state ?? '',
            grossSalary: Number(r.details?.grossSalary ?? 0),
            ptSlab: r.details?.ptSlab ?? '',
            ptAmount: Number(r.amount ?? r.details?.ptAmount ?? 0),
            ptApplicable: r.details?.ptApplicable ?? true,
          }));
          setRecords(mapped);
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
    return records.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesState = selectedState === 'all' || record.state === selectedState;
      return matchesSearch && matchesDepartment && matchesState;
    });
  }, [records, searchTerm, selectedDepartment, selectedState]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const states = ['all', 'Karnataka', 'Maharashtra', 'Tamil Nadu'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    verified: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Professional Tax</h1>
        <p className="text-sm text-gray-600 mt-1">State-wise Professional Tax calculation and payment</p>
        {isLoading && <p className="text-xs text-gray-400 mt-1">Loading…</p>}
        {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm border border-orange-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{ptMonth.monthYear}</h2>
            <p className="text-sm text-gray-600 mt-1">Pay Period: {ptMonth.payPeriod}</p>
            <p className="text-xs text-gray-500 mt-1">PT Month ID: {ptMonth.id}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[ptMonth.status]} block mb-2`}>
              {ptMonth.status.toUpperCase()}
            </span>
            <p className="text-xs text-gray-600">
              Due Date: {new Date(ptMonth.dueDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{ptMonth.employeeCount}</p>
              </div>
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total PT Collected</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(ptMonth.totalPTCollected)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">State</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{ptMonth.state}</p>
              </div>
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Status</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{ptMonth.status.toUpperCase()}</p>
              </div>
              <Receipt className="h-6 w-6 text-purple-600" />
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
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {states.map(state => (
              <option key={state} value={state}>
                {state === 'all' ? 'All States' : state}
              </option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Download Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <FileText className="h-4 w-4" />
            PT Challan
          </button>
        </div>
      </div>

      {records.length === 0 && !isLoading && (
        <EmptyState
          icon={Receipt}
          title="No professional tax records"
          description="No Professional Tax data is available for this period yet."
        />
      )}

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
                  {record.ptApplicable && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      PT APPLICABLE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  State: {record.state}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">PT Amount</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(record.ptAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Salary Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Gross Salary</span>
                    <span className="font-medium text-gray-900">{formatCurrency(record.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">State</span>
                    <span className="font-medium text-gray-900">{record.state}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">PT Slab</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-orange-700">Income Slab</p>
                    <p className="text-sm font-medium text-orange-900">{record.ptSlab}</p>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-orange-900">PT Amount</span>
                      <span className="font-bold text-orange-900">{formatCurrency(record.ptAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">Deduction</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Deducted from Salary</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.ptAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Payable to Govt</span>
                    <span className="font-medium text-blue-900">{formatCurrency(record.ptAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">Professional Tax Guidelines (Karnataka)</h3>
        <div className="mb-3">
          <h4 className="text-xs font-bold text-orange-800 mb-2">PT Slabs for Karnataka:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-orange-800">
            <div className="bg-white p-2 rounded">• Up to ₹15,000: Nil</div>
            <div className="bg-white p-2 rounded">• ₹15,001 to ₹30,000: ₹200/month</div>
            <div className="bg-white p-2 rounded">• ₹30,001 to ₹40,000: ₹200/month</div>
            <div className="bg-white p-2 rounded">• Above ₹40,000: ₹200/month</div>
          </div>
        </div>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• <strong>State-wise Tax:</strong> Professional Tax rates vary by state</li>
          <li>• <strong>Maximum Limit:</strong> ₹2,500 per year as per constitution</li>
          <li>• <strong>Deduction:</strong> PT deducted from employee salary monthly</li>
          <li>• <strong>Payment:</strong> Employer deposits collected PT to state government</li>
          <li>• <strong>Due Date:</strong> Typically 20th-21st of following month (varies by state)</li>
          <li>• <strong>Registration:</strong> Employer must register for PT in each applicable state</li>
          <li>• <strong>Returns:</strong> Annual PT returns to be filed</li>
        </ul>
      </div>
    </div>
  );
}
