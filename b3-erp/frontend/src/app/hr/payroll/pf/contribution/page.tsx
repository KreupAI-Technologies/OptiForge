'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wallet, Search, Download, FileText, Users, DollarSign, TrendingUp, Calendar, X, CheckCircle, AlertCircle, Building2, Mail } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface EmployeePFContribution {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  uan: string;
  basicSalary: number;
  pfBasic: number;
  employeeContribution: number;
  employerContribution: number;
  pensionFund: number;
  epf: number;
  edli: number;
  adminCharges: number;
  totalEmployer: number;
  totalContribution: number;
  pfAccountNumber: string;
}

interface PFContributionMonth {
  id: string;
  monthYear: string;
  payPeriod: string;
  employeeCount: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalPensionFund: number;
  totalEPF: number;
  totalEDLI: number;
  totalAdminCharges: number;
  totalPayable: number;
  dueDate: string;
  status: 'draft' | 'verified' | 'submitted';
  records: EmployeePFContribution[];
}

// Modal Components
function DownloadECRModal({ pfMonth, onClose, formatCurrency }: { pfMonth: PFContributionMonth; onClose: () => void; formatCurrency: (amount: number) => string }) {
  const [format, setFormat] = useState<'text' | 'excel'>('text');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Download ECR File</h3>
            <p className="text-sm text-gray-600 mt-1">Electronic Challan cum Return - {pfMonth.monthYear}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* ECR Summary */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ECR File Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-blue-700 mb-1">Wage Month</p>
                <p className="font-semibold text-blue-900">{pfMonth.monthYear}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">Total Employees</p>
                <p className="font-semibold text-blue-900">{pfMonth.employeeCount}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">Employee Share</p>
                <p className="font-semibold text-blue-900">{formatCurrency(pfMonth.totalEmployeeContribution)}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">Employer Share</p>
                <p className="font-semibold text-blue-900">{formatCurrency(pfMonth.totalEmployerContribution)}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">EPS Contribution</p>
                <p className="font-semibold text-blue-900">{formatCurrency(pfMonth.totalPensionFund)}</p>
              </div>
              <div>
                <p className="text-blue-700 mb-1">Total Payable</p>
                <p className="font-semibold text-blue-900">{formatCurrency(pfMonth.totalPayable)}</p>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select ECR Format</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="text"
                  checked={format === 'text'}
                  onChange={(e) => setFormat(e.target.value as 'text')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Text Format (.txt)</p>
                  <p className="text-sm text-gray-600 mt-1">Standard ECR text file format for EPFO Unified Portal. This is the most commonly used format.</p>
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                    <p className="font-mono">Format: Fixed width text file with header and member records</p>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as 'excel')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Excel Format (.xlsx)</p>
                  <p className="text-sm text-gray-600 mt-1">Excel workbook with formatted columns for easy review before uploading to EPFO portal.</p>
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                    <p className="font-mono">Format: Spreadsheet with columns for UAN, Name, Wages, Contributions, etc.</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* ECR Contents Preview */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">ECR File Contents</h4>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Header Information</p>
                    <p className="text-gray-600 text-xs">Establishment ID, Return Month, Number of Members</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Member Records ({pfMonth.employeeCount} employees)</p>
                    <p className="text-gray-600 text-xs">UAN, Name, Wages, EPF Contribution, EPS Contribution, EDLI, Admin Charges</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Summary Totals</p>
                    <p className="text-gray-600 text-xs">Total wages, contributions, and payable amounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-2">Important Instructions</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Download this file and upload it to the EPFO Unified Portal</li>
                  <li>ECR must be filed by the 15th of the following month</li>
                  <li>Ensure all UAN numbers are correct before filing</li>
                  <li>Payment must be made along with ECR filing</li>
                  <li>Keep a copy of the filed ECR for your records</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle download logic
                console.log(`Downloading ECR in ${format} format`);
                onClose();
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download {format === 'text' ? 'Text' : 'Excel'} File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PFChallanModal({ pfMonth, onClose, formatCurrency }: { pfMonth: PFContributionMonth; onClose: () => void; formatCurrency: (amount: number) => string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">PF Challan</h3>
            <p className="text-sm text-gray-600 mt-1">Payment Details for {pfMonth.monthYear}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Company Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ManufacturingOS Manufacturing Pvt. Ltd.</h2>
                <p className="text-sm text-gray-600">Provident Fund Payment Challan</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Industrial Area, Bangalore - 560001</p>
              <p>PF Establishment Code: KA/BLR/0012345</p>
              <p>LIN: 1234567890</p>
            </div>
          </div>

          {/* Challan Details */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Challan Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-blue-700">Wage Month</p>
                <p className="font-semibold text-blue-900">{pfMonth.monthYear}</p>
              </div>
              <div>
                <p className="text-blue-700">Due Date</p>
                <p className="font-semibold text-blue-900">{new Date(pfMonth.dueDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-blue-700">Total Employees</p>
                <p className="font-semibold text-blue-900">{pfMonth.employeeCount}</p>
              </div>
              <div>
                <p className="text-blue-700">Challan Number</p>
                <p className="font-semibold text-blue-900">CH-{pfMonth.id}</p>
              </div>
            </div>
          </div>

          {/* Contribution Breakdown */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contribution Breakdown</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Component</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Percentage</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Employee's EPF Contribution (A)</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">12%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(pfMonth.totalEmployeeContribution)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Employer's EPS Contribution</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">8.33%</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(pfMonth.totalPensionFund)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 pl-8">Employer's EPF Contribution</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">3.67%</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(pfMonth.totalEPF)}</td>
                  </tr>
                  <tr className="bg-purple-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Employer's Total Contribution (B)</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">12%</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(pfMonth.totalEmployerContribution)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">EDLI Contribution</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">0.5%</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(pfMonth.totalEDLI)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Admin Charges (EPFO)</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">0.5%</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(pfMonth.totalAdminCharges)}</td>
                  </tr>
                  <tr className="bg-blue-100 border-t-2 border-blue-300">
                    <td className="px-4 py-4 text-base font-bold text-blue-900">Total Amount Payable (A + B + Charges)</td>
                    <td className="px-4 py-4 text-base font-bold text-blue-900 text-right"></td>
                    <td className="px-4 py-4 text-xl font-bold text-blue-900 text-right">{formatCurrency(pfMonth.totalPayable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Payment Instructions</h4>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="space-y-3 text-sm text-green-900">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-green-700 font-medium">Payable To</p>
                    <p className="font-semibold">EPFO - Regional PF Commissioner</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-medium">Payment Mode</p>
                    <p className="font-semibold">Online through EPFO Portal</p>
                  </div>
                </div>
                <div>
                  <p className="text-green-700 font-medium mb-1">Payment Account Details</p>
                  <div className="bg-white rounded p-3 space-y-1">
                    <p><span className="font-medium">Account Name:</span> Regional PF Commissioner, Bangalore</p>
                    <p><span className="font-medium">Account Number:</span> XXXX-XXXX-XXXX-1234</p>
                    <p><span className="font-medium">IFSC Code:</span> SBIN0001234</p>
                    <p><span className="font-medium">Bank:</span> State Bank of India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-2">Payment Instructions</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Payment must be made by {new Date(pfMonth.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</li>
                  <li>Pay online through EPFO Unified Portal for instant reconciliation</li>
                  <li>Ensure ECR is filed along with the payment</li>
                  <li>Late payment attracts 12% per annum interest and penalties</li>
                  <li>Keep transaction reference number for reconciliation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Declaration:</strong> I hereby declare that the particulars given above are true and correct to the best of my knowledge and belief.
              </p>
              <div className="flex justify-between items-end pt-8">
                <div>
                  <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <div className="border-t border-gray-400 pt-2 w-48">
                    <p className="font-medium">Authorized Signatory</p>
                    <p className="text-xs text-gray-500">HR/Accounts Department</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Challan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PFContributionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showECRModal, setShowECRModal] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);

  const mockPFMonth: PFContributionMonth = {
    id: 'PF-2025-11',
    monthYear: 'November 2025',
    payPeriod: '01-Nov-2025 to 30-Nov-2025',
    employeeCount: 6,
    totalEmployeeContribution: 13550,
    totalEmployerContribution: 9047,
    totalPensionFund: 11083,
    totalEPF: 2467,
    totalEDLI: 271,
    totalAdminCharges: 226,
    totalPayable: 22597,
    dueDate: '2025-12-15',
    status: 'verified',
    records: [
      {
        id: 'PF-001',
        employeeId: 'EMP001',
        employeeName: 'Rajesh Kumar',
        designation: 'Senior Production Manager',
        department: 'Production',
        uan: 'UAN101234567890',
        basicSalary: 31250,
        pfBasic: 31250,
        employeeContribution: 3750,
        employerContribution: 2501,
        pensionFund: 3125,
        epf: 625,
        edli: 45,
        adminCharges: 38,
        totalEmployer: 2626,
        totalContribution: 6376,
        pfAccountNumber: 'KA/BLR/0012345/001'
      },
      {
        id: 'PF-002',
        employeeId: 'EMP002',
        employeeName: 'Priya Sharma',
        designation: 'Quality Control Supervisor',
        department: 'Quality',
        uan: 'UAN101234567891',
        basicSalary: 22917,
        pfBasic: 22917,
        employeeContribution: 2750,
        employerContribution: 1834,
        pensionFund: 2292,
        epf: 458,
        edli: 33,
        adminCharges: 28,
        totalEmployer: 1923,
        totalContribution: 4673,
        pfAccountNumber: 'KA/BLR/0012345/002'
      },
      {
        id: 'PF-003',
        employeeId: 'EMP003',
        employeeName: 'Amit Patel',
        designation: 'Production Operator',
        department: 'Production',
        uan: 'UAN101234567892',
        basicSalary: 14583,
        pfBasic: 14583,
        employeeContribution: 1750,
        employerContribution: 1167,
        pensionFund: 1458,
        epf: 292,
        edli: 21,
        adminCharges: 18,
        totalEmployer: 1225,
        totalContribution: 2975,
        pfAccountNumber: 'KA/BLR/0012345/003'
      },
      {
        id: 'PF-004',
        employeeId: 'EMP004',
        employeeName: 'Neha Singh',
        designation: 'Maintenance Engineer',
        department: 'Maintenance',
        uan: 'UAN101234567893',
        basicSalary: 21667,
        pfBasic: 21667,
        employeeContribution: 2600,
        employerContribution: 1734,
        pensionFund: 2167,
        epf: 433,
        edli: 31,
        adminCharges: 26,
        totalEmployer: 1817,
        totalContribution: 4417,
        pfAccountNumber: 'KA/BLR/0012345/004'
      },
      {
        id: 'PF-005',
        employeeId: 'EMP005',
        employeeName: 'Vikram Desai',
        designation: 'Logistics Coordinator',
        department: 'Logistics',
        uan: 'UAN101234567894',
        basicSalary: 20000,
        pfBasic: 20000,
        employeeContribution: 2400,
        employerContribution: 1600,
        pensionFund: 2000,
        epf: 400,
        edli: 29,
        adminCharges: 24,
        totalEmployer: 1677,
        totalContribution: 4077,
        pfAccountNumber: 'KA/BLR/0012345/005'
      },
      {
        id: 'PF-006',
        employeeId: 'EMP006',
        employeeName: 'Kavita Mehta',
        designation: 'HR Executive',
        department: 'HR',
        uan: 'UAN101234567895',
        basicSalary: 20833,
        pfBasic: 20833,
        employeeContribution: 2500,
        employerContribution: 1667,
        pensionFund: 2083,
        epf: 417,
        edli: 30,
        adminCharges: 25,
        totalEmployer: 1755,
        totalContribution: 4255,
        pfAccountNumber: 'KA/BLR/0012345/006'
      }
    ]
  };

  const [records, setRows] = useState<EmployeePFContribution[]>(mockPFMonth.records);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrPayrollService.getStatutoryFilings('pf-contribution');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.details?.employeeId ?? r.employeeCode ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            designation: r.designation ?? r.details?.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            uan: r.uan ?? r.details?.uan ?? '',
            basicSalary: r.details?.basicSalary ?? r.basicSalary ?? 0,
            pfBasic: r.details?.pfBasic ?? r.pfBasic ?? 0,
            employeeContribution: r.amount ?? r.details?.employeeContribution ?? 0,
            employerContribution: r.details?.employerContribution ?? r.employerContribution ?? 0,
            pensionFund: r.details?.pensionFund ?? r.pensionFund ?? 0,
            epf: r.details?.epf ?? r.epf ?? 0,
            edli: r.details?.edli ?? r.edli ?? 0,
            adminCharges: r.details?.adminCharges ?? r.adminCharges ?? 0,
            totalEmployer: r.details?.totalEmployer ?? r.totalEmployer ?? 0,
            totalContribution: r.details?.totalContribution ?? r.totalContribution ?? 0,
            pfAccountNumber: r.pfAccountNumber ?? r.details?.pfAccountNumber ?? '',
          } as EmployeePFContribution));
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
        record.uan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [records, searchTerm, selectedDepartment]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

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
        <h1 className="text-2xl font-bold text-gray-900">PF Contribution</h1>
        <p className="text-sm text-gray-600 mt-1">Monthly Provident Fund contribution calculations</p>
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{mockPFMonth.monthYear}</h2>
            <p className="text-sm text-gray-600 mt-1">Pay Period: {mockPFMonth.payPeriod}</p>
            <p className="text-xs text-gray-500 mt-1">PF Month ID: {mockPFMonth.id}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[mockPFMonth.status]} block mb-2`}>
              {mockPFMonth.status.toUpperCase()}
            </span>
            <p className="text-xs text-gray-600">
              Due Date: {new Date(mockPFMonth.dueDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockPFMonth.employeeCount}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employee Share</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(mockPFMonth.totalEmployeeContribution)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Employer Share</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(mockPFMonth.totalEmployerContribution)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Payable</p>
                <p className="text-lg font-bold text-blue-900 mt-1">{formatCurrency(mockPFMonth.totalPayable)}</p>
              </div>
              <Wallet className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-1">Pension Fund (EPS)</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(mockPFMonth.totalPensionFund)}</p>
          <p className="text-xs text-blue-700 mt-1">8.33% of Basic</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-medium text-green-600 mb-1">EPF Balance</p>
          <p className="text-xl font-bold text-green-900">{formatCurrency(mockPFMonth.totalEPF)}</p>
          <p className="text-xs text-green-700 mt-1">3.67% of Basic</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-xs font-medium text-purple-600 mb-1">EDLI Charges</p>
          <p className="text-xl font-bold text-purple-900">{formatCurrency(mockPFMonth.totalEDLI)}</p>
          <p className="text-xs text-purple-700 mt-1">0.5% of Basic</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-xs font-medium text-orange-600 mb-1">Admin Charges</p>
          <p className="text-xl font-bold text-orange-900">{formatCurrency(mockPFMonth.totalAdminCharges)}</p>
          <p className="text-xs text-orange-700 mt-1">0.5% of Basic</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <p className="text-xs font-medium text-indigo-600 mb-1">Due Date</p>
          <p className="text-sm font-bold text-indigo-900 mt-1">
            {new Date(mockPFMonth.dueDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
          <p className="text-xs text-indigo-700 mt-1">15th of next month</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or UAN..."
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
            onClick={() => setShowECRModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download ECR
          </button>
          <button
            onClick={() => setShowChallanModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText className="h-4 w-4" />
            PF Challan
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
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  UAN: {record.uan} • PF A/C: {record.pfAccountNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Contribution</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(record.totalContribution)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Salary Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-medium text-gray-900">{formatCurrency(record.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">PF Basic</span>
                    <span className="font-medium text-gray-900">{formatCurrency(record.pfBasic)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">Employee Share</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">EPF (12%)</span>
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
                    <span className="text-purple-700">EPS (8.33%)</span>
                    <span className="font-medium text-purple-900">{formatCurrency(record.pensionFund)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">EPF (3.67%)</span>
                    <span className="font-medium text-purple-900">{formatCurrency(record.epf)}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-purple-900">Subtotal</span>
                      <span className="font-bold text-purple-900">{formatCurrency(record.employerContribution)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">Other Charges</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">EDLI (0.5%)</span>
                    <span className="font-medium text-orange-900">{formatCurrency(record.edli)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">Admin (0.5%)</span>
                    <span className="font-medium text-orange-900">{formatCurrency(record.adminCharges)}</span>
                  </div>
                  <div className="pt-2 border-t border-orange-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-orange-900">Total Employer</span>
                      <span className="font-bold text-orange-900">{formatCurrency(record.totalEmployer)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">PF Contribution Guidelines (India)</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Employee Contribution:</strong> 12% of Basic + DA (deducted from salary)</li>
          <li>• <strong>Employer Contribution:</strong> 12% of Basic + DA (8.33% to EPS, 3.67% to EPF)</li>
          <li>• <strong>EPS (Pension Fund):</strong> Maximum capped at ₹1,250/month (8.33% of ₹15,000)</li>
          <li>• <strong>EDLI Charges:</strong> 0.5% of Basic + DA (max ₹75/month)</li>
          <li>• <strong>Admin Charges:</strong> 0.5% of Basic + DA for EPFO administration</li>
          <li>• <strong>Due Date:</strong> 15th of the following month</li>
          <li>• <strong>ECR Filing:</strong> Electronic Challan cum Return to be filed online</li>
        </ul>
      </div>

      {/* Modals */}
      {showECRModal && (
        <DownloadECRModal
          pfMonth={mockPFMonth}
          onClose={() => setShowECRModal(false)}
          formatCurrency={formatCurrency}
        />
      )}

      {showChallanModal && (
        <PFChallanModal
          pfMonth={mockPFMonth}
          onClose={() => setShowChallanModal(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
