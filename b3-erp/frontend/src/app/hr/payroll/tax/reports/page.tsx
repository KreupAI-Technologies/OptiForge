'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, Filter, Eye, Mail, Calendar, TrendingUp, Users, DollarSign, X, CheckCircle, AlertCircle } from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';

interface TaxReport {
  id: string;
  reportName: string;
  period: string;
  generatedDate: string;
  reportType: string;
  totalEmployees: number;
  totalTaxDeducted: number;
  status: 'completed' | 'pending' | 'error';
}

interface ReportDetails {
  summary: {
    totalEmployees: number;
    totalGrossSalary: number;
    totalTaxableIncome: number;
    totalTaxDeducted: number;
    totalTaxDeposited: number;
    pendingDeposit: number;
  };
  breakdown: {
    category: string;
    employees: number;
    taxAmount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    taxDeducted: number;
    taxDeposited: number;
  }[];
}

// Modal Components
function ViewReportModal({ report, onClose, formatCurrency }: { report: TaxReport; onClose: () => void; formatCurrency: (amount: number) => string }) {
  const reportDetails: ReportDetails = {
    summary: {
      totalEmployees: report.totalEmployees,
      totalGrossSalary: 45600000,
      totalTaxableIncome: 38400000,
      totalTaxDeducted: report.totalTaxDeducted,
      totalTaxDeposited: report.totalTaxDeducted - 125000,
      pendingDeposit: 125000
    },
    breakdown: [
      { category: 'No Tax (Income < 2.5L)', employees: 45, taxAmount: 0, percentage: 0 },
      { category: '5% Slab (2.5L - 5L)', employees: 78, taxAmount: 585000, percentage: 8.5 },
      { category: '10% Slab (5L - 7.5L)', employees: 92, taxAmount: 1380000, percentage: 20.1 },
      { category: '15% Slab (7.5L - 10L)', employees: 68, taxAmount: 1530000, percentage: 22.3 },
      { category: '20% Slab (10L - 12.5L)', employees: 45, taxAmount: 1350000, percentage: 19.7 },
      { category: '30% Slab (> 12.5L)', employees: 34, taxAmount: 2040000, percentage: 29.4 }
    ],
    monthlyTrend: [
      { month: 'Apr 2024', taxDeducted: 6750000, taxDeposited: 6750000 },
      { month: 'May 2024', taxDeducted: 6820000, taxDeposited: 6820000 },
      { month: 'Jun 2024', taxDeducted: 6885000, taxDeposited: 6885000 },
      { month: 'Jul 2024', taxDeducted: 6950000, taxDeposited: 6950000 },
      { month: 'Aug 2024', taxDeducted: 7020000, taxDeposited: 6895000 }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{report.reportName}</h3>
            <p className="text-sm text-gray-600 mt-1">Period: {report.period} | Generated: {report.generatedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Summary Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Tax Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{reportDetails.summary.totalEmployees}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Gross Salary</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(reportDetails.summary.totalGrossSalary)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Taxable Income</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(reportDetails.summary.totalTaxableIncome)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">Total Tax Deducted</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(reportDetails.summary.totalTaxDeducted)}</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                <p className="text-sm text-teal-600 font-medium">Total Tax Deposited</p>
                <p className="text-2xl font-bold text-teal-900 mt-1">{formatCurrency(reportDetails.summary.totalTaxDeposited)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-600 font-medium">Pending Deposit</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(reportDetails.summary.pendingDeposit)}</p>
              </div>
            </div>
          </div>

          {/* Tax Slab Breakdown */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Tax Slab Breakdown</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tax Slab</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Employees</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tax Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportDetails.breakdown.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.employees}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.taxAmount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-blue-900">Total</td>
                    <td className="px-4 py-3 text-sm text-blue-900 text-right">{reportDetails.summary.totalEmployees}</td>
                    <td className="px-4 py-3 text-sm text-blue-900 text-right">{formatCurrency(reportDetails.summary.totalTaxDeducted)}</td>
                    <td className="px-4 py-3 text-sm text-blue-900 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trend */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Monthly TDS Trend</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Month</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tax Deducted</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tax Deposited</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportDetails.monthlyTrend.map((item, index) => {
                    const difference = item.taxDeducted - item.taxDeposited;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.month}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.taxDeducted)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.taxDeposited)}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {difference === 0 ? '✓ Matched' : formatCurrency(difference)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </button>
            <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Email Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateReportModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    reportType: 'monthly-tds',
    financialYear: '2024-25',
    period: 'August 2024',
    includeDetails: true,
    includeCharts: true,
    format: 'pdf'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Generate New Report</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly-tds">Monthly TDS Report</option>
              <option value="quarterly-summary">Quarterly Tax Summary</option>
              <option value="annual-statement">Annual Tax Statement</option>
              <option value="tax-slab-analysis">Tax Slab Analysis</option>
              <option value="challan-summary">Challan Summary</option>
              <option value="form16-summary">Form 16 Summary</option>
              <option value="comparative-analysis">Comparative Analysis</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
              <select
                value={formData.financialYear}
                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="August 2024">August 2024</option>
                <option value="July 2024">July 2024</option>
                <option value="June 2024">June 2024</option>
                <option value="Q1 2024-25">Q1 2024-25</option>
                <option value="Q2 2024-25">Q2 2024-25</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeDetails}
                  onChange={(e) => setFormData({ ...formData, includeDetails: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include detailed employee breakdown</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeCharts}
                  onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include charts and visualizations</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pdf"
                  checked={formData.format === 'pdf'}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">PDF</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="excel"
                  checked={formData.format === 'excel'}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Excel</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="csv"
                  checked={formData.format === 'csv'}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">CSV</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Report Generation</p>
                <p>The report will be generated based on the latest payroll data and tax calculations. Large reports may take a few moments to generate.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmailReportModal({ report, onClose, formatCurrency }: { report: TaxReport; onClose: () => void; formatCurrency: (amount: number) => string }) {
  const [emailData, setEmailData] = useState({
    recipients: '',
    subject: `Tax Report - ${report.reportName} (${report.period})`,
    message: `Please find attached the ${report.reportName} for ${report.period}.\n\nTotal Employees: ${report.totalEmployees}\nTotal Tax Deducted: ${formatCurrency(report.totalTaxDeducted)}\n\nThis is an automated email from ManufacturingOS ERP System.`,
    includeAttachment: true,
    format: 'pdf'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email sending logic
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Email Report</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Report Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Report Name:</span>
                <span className="ml-2 text-gray-900 font-medium">{report.reportName}</span>
              </div>
              <div>
                <span className="text-gray-600">Period:</span>
                <span className="ml-2 text-gray-900 font-medium">{report.period}</span>
              </div>
              <div>
                <span className="text-gray-600">Employees:</span>
                <span className="ml-2 text-gray-900 font-medium">{report.totalEmployees}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Tax:</span>
                <span className="ml-2 text-gray-900 font-medium">{formatCurrency(report.totalTaxDeducted)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <input
              type="text"
              value={emailData.recipients}
              onChange={(e) => setEmailData({ ...emailData, recipients: e.target.value })}
              placeholder="Enter email addresses separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple email addresses with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={emailData.includeAttachment}
                onChange={(e) => setEmailData({ ...emailData, includeAttachment: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Include report as attachment</span>
            </label>

            {emailData.includeAttachment && (
              <div className="ml-6 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="pdf"
                    checked={emailData.format === 'pdf'}
                    onChange={(e) => setEmailData({ ...emailData, format: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">PDF Format</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="excel"
                    checked={emailData.format === 'excel'}
                    onChange={(e) => setEmailData({ ...emailData, format: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Excel Format</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Component
export default function Page() {
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const [reports, setReports] = useState<TaxReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await PayrollService.getTaxRecords()) as any[];
        const statusMap: Record<string, TaxReport['status']> = {
          Completed: 'completed',
          Pending: 'pending',
          Error: 'error',
        };
        const mapped: TaxReport[] = raw.map((r) => ({
          id: r.id,
          reportName: r.category ?? 'Tax Record',
          period: r.period ?? r.financialYear ?? '',
          generatedDate: r.createdAt ? String(r.createdAt).split('T')[0] : '',
          reportType: (r.category ?? '').toString().toLowerCase(),
          totalEmployees: Number(r.details?.totalEmployees ?? 0),
          totalTaxDeducted: Number(r.amount ?? 0),
          status: statusMap[r.status] ?? 'completed',
        }));
        if (!cancelled) setReports(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load tax reports');
          setReports([]);
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

  const handleViewReport = (report: TaxReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleEmailReport = (report: TaxReport) => {
    setSelectedReport(report);
    setShowEmailModal(true);
  };

  const handleGenerateReport = (data: any) => {
    console.log('Generating report with data:', data);
    setShowGenerateModal(false);
  };

  const filteredReports = reports.filter(report => {
    if (filterType !== 'all' && report.reportType !== filterType) return false;
    if (filterPeriod !== 'all' && !report.period.includes(filterPeriod)) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status as keyof typeof styles] || styles.completed;
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-yellow-600" />
          Tax Reports
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive tax analytics, reports, and insights</p>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm mb-3">
          Loading tax reports…
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm mb-3">
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold mt-1">{reports.length}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold mt-1">362</p>
            </div>
            <Users className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tax This Month</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(6885000)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">YTD Tax</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(34425000)}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Report Types</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="analysis">Analysis</option>
                <option value="challan">Challan</option>
                <option value="form16">Form 16</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Periods</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <FileText className="h-4 w-4" />
            Generate New Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Report Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employees</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Tax</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Generated</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{report.reportName}</div>
                    <div className="text-xs text-gray-500">ID: {report.id}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{report.period}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {report.reportType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{report.totalEmployees}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatCurrency(report.totalTaxDeducted)}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{report.generatedDate}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(report.status)} capitalize`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEmailReport(report)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Email Report"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No reports found matching the selected filters.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showViewModal && selectedReport && (
        <ViewReportModal
          report={selectedReport}
          onClose={() => {
            setShowViewModal(false);
            setSelectedReport(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {showGenerateModal && (
        <GenerateReportModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateReport}
        />
      )}

      {showEmailModal && selectedReport && (
        <EmailReportModal
          report={selectedReport}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedReport(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
