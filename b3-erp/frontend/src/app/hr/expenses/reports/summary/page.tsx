'use client';

import { useState, useMemo, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, Calendar, Users, Receipt, DollarSign, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';
import { HrPagesService } from '@/services/hr-pages.service';

interface MonthlySummary {
  month: string;
  totalClaims: number;
  totalAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  pendingAmount: number;
  avgClaimAmount: number;
}

interface CategorySummary {
  category: string;
  totalClaims: number;
  totalAmount: number;
  percentageOfTotal: number;
}

export default function ExpenseSummaryPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');

  const monthlyData: MonthlySummary[] = [
    { month: 'Jan 2025', totalClaims: 145, totalAmount: 892000, approvedAmount: 785000, rejectedAmount: 45000, pendingAmount: 62000, avgClaimAmount: 6152 },
    { month: 'Feb 2025', totalClaims: 132, totalAmount: 825000, approvedAmount: 742000, rejectedAmount: 38000, pendingAmount: 45000, avgClaimAmount: 6250 },
    { month: 'Mar 2025', totalClaims: 168, totalAmount: 1045000, approvedAmount: 952000, rejectedAmount: 52000, pendingAmount: 41000, avgClaimAmount: 6220 },
    { month: 'Apr 2025', totalClaims: 155, totalAmount: 965000, approvedAmount: 875000, rejectedAmount: 42000, pendingAmount: 48000, avgClaimAmount: 6226 },
    { month: 'May 2025', totalClaims: 178, totalAmount: 1125000, approvedAmount: 1015000, rejectedAmount: 58000, pendingAmount: 52000, avgClaimAmount: 6320 },
    { month: 'Jun 2025', totalClaims: 162, totalAmount: 1008000, approvedAmount: 912000, rejectedAmount: 48000, pendingAmount: 48000, avgClaimAmount: 6222 },
    { month: 'Jul 2025', totalClaims: 148, totalAmount: 925000, approvedAmount: 835000, rejectedAmount: 45000, pendingAmount: 45000, avgClaimAmount: 6250 },
    { month: 'Aug 2025', totalClaims: 165, totalAmount: 1035000, approvedAmount: 945000, rejectedAmount: 48000, pendingAmount: 42000, avgClaimAmount: 6273 },
    { month: 'Sep 2025', totalClaims: 172, totalAmount: 1085000, approvedAmount: 982000, rejectedAmount: 52000, pendingAmount: 51000, avgClaimAmount: 6308 },
    { month: 'Oct 2025', totalClaims: 185, totalAmount: 1165000, approvedAmount: 1058000, rejectedAmount: 55000, pendingAmount: 52000, avgClaimAmount: 6297 },
    { month: 'Nov 2025', totalClaims: 158, totalAmount: 982000, approvedAmount: 892000, rejectedAmount: 45000, pendingAmount: 45000, avgClaimAmount: 6215 },
    { month: 'Dec 2025', totalClaims: 142, totalAmount: 885000, approvedAmount: 805000, rejectedAmount: 42000, pendingAmount: 38000, avgClaimAmount: 6232 }
  ];

  const categoryData: CategorySummary[] = [
    { category: 'Travel', totalClaims: 485, totalAmount: 3250000, percentageOfTotal: 28 },
    { category: 'Accommodation', totalClaims: 198, totalAmount: 1875000, percentageOfTotal: 16 },
    { category: 'Meals & Entertainment', totalClaims: 365, totalAmount: 1520000, percentageOfTotal: 13 },
    { category: 'Fuel', totalClaims: 412, totalAmount: 1425000, percentageOfTotal: 12 },
    { category: 'Office Supplies', totalClaims: 285, totalAmount: 1165000, percentageOfTotal: 10 },
    { category: 'Communication', totalClaims: 325, totalAmount: 985000, percentageOfTotal: 8 },
    { category: 'Training & Development', totalClaims: 145, totalAmount: 875000, percentageOfTotal: 8 },
    { category: 'Other', totalClaims: 195, totalAmount: 842000, percentageOfTotal: 7 }
  ];

  const yearlyTotals = useMemo(() => {
    return monthlyData.reduce(
      (acc, month) => ({
        totalClaims: acc.totalClaims + month.totalClaims,
        totalAmount: acc.totalAmount + month.totalAmount,
        approvedAmount: acc.approvedAmount + month.approvedAmount,
        rejectedAmount: acc.rejectedAmount + month.rejectedAmount,
        pendingAmount: acc.pendingAmount + month.pendingAmount
      }),
      { totalClaims: 0, totalAmount: 0, approvedAmount: 0, rejectedAmount: 0, pendingAmount: 0 }
    );
  }, []);

  const avgClaimAmount = yearlyTotals.totalClaims > 0
    ? Math.round(yearlyTotals.totalAmount / yearlyTotals.totalClaims)
    : 0;

  const approvalRate = yearlyTotals.totalAmount > 0
    ? Math.round((yearlyTotals.approvedAmount / yearlyTotals.totalAmount) * 100)
    : 0;

  const rejectionRate = yearlyTotals.totalAmount > 0
    ? Math.round((yearlyTotals.rejectedAmount / yearlyTotals.totalAmount) * 100)
    : 0;

  const handleExportToExcel = () => {
    try {
      // Monthly summary sheet
      const monthlyExport = monthlyData.map(m => ({
        'Month': m.month,
        'Total Claims': m.totalClaims,
        'Total Amount': m.totalAmount,
        'Approved Amount': m.approvedAmount,
        'Rejected Amount': m.rejectedAmount,
        'Pending Amount': m.pendingAmount,
        'Avg Claim Amount': m.avgClaimAmount
      }));

      // Category summary sheet
      const categoryExport = categoryData.map(c => ({
        'Category': c.category,
        'Total Claims': c.totalClaims,
        'Total Amount': c.totalAmount,
        'Percentage': c.percentageOfTotal + '%'
      }));

      // Summary totals
      const totalsExport = [{
        'Metric': 'Total Claims',
        'Value': yearlyTotals.totalClaims
      }, {
        'Metric': 'Total Amount',
        'Value': yearlyTotals.totalAmount
      }, {
        'Metric': 'Approved Amount',
        'Value': yearlyTotals.approvedAmount
      }, {
        'Metric': 'Rejected Amount',
        'Value': yearlyTotals.rejectedAmount
      }, {
        'Metric': 'Pending Amount',
        'Value': yearlyTotals.pendingAmount
      }, {
        'Metric': 'Approval Rate',
        'Value': approvalRate + '%'
      }, {
        'Metric': 'Rejection Rate',
        'Value': rejectionRate + '%'
      }, {
        'Metric': 'Avg Claim Amount',
        'Value': avgClaimAmount
      }];

      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(totalsExport);
      const ws2 = XLSX.utils.json_to_sheet(monthlyExport);
      const ws3 = XLSX.utils.json_to_sheet(categoryExport);

      ws1['!cols'] = [{ wch: 25 }, { wch: 20 }];
      ws2['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      ws3['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];

      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
      XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Breakdown');
      XLSX.utils.book_append_sheet(wb, ws3, 'Category Breakdown');

      XLSX.writeFile(wb, `Expense_Summary_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: `Expense summary for ${selectedYear} exported successfully`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export expense summary",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-purple-600" />
            Expense Summary
          </h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive expense analytics and trends</p>
        </div>
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700">Total Claims</p>
            <Receipt className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{yearlyTotals.totalClaims}</p>
          <p className="text-xs text-purple-600 mt-1">Year to date</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Total Amount</p>
            <DollarSign className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-900">₹{(yearlyTotals.totalAmount / 10000000).toFixed(2)}Cr</p>
          <p className="text-xs text-blue-600 mt-1">All categories</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Approval Rate</p>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900">{approvalRate}%</p>
          <p className="text-xs text-green-600 mt-1">₹{(yearlyTotals.approvedAmount / 100000).toFixed(1)}L approved</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-700">Avg Claim</p>
            <Users className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-900">₹{(avgClaimAmount / 1000).toFixed(1)}k</p>
          <p className="text-xs text-orange-600 mt-1">Per expense claim</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
              <option value={currentYear - 2}>{currentYear - 2}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="yearly">Yearly</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Monthly Expense Trend
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{month.totalClaims}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{(month.totalAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600">
                    ₹{(month.approvedAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600">
                    ₹{(month.rejectedAmount / 1000).toFixed(0)}k
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-orange-600">
                    ₹{(month.pendingAmount / 1000).toFixed(0)}k
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                    ₹{(month.avgClaimAmount / 1000).toFixed(1)}k
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-purple-50">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-900">TOTAL</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-900">{yearlyTotals.totalClaims}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-900">
                  ₹{(yearlyTotals.totalAmount / 10000000).toFixed(2)}Cr
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-green-700">
                  ₹{(yearlyTotals.approvedAmount / 10000000).toFixed(2)}Cr
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-red-700">
                  ₹{(yearlyTotals.rejectedAmount / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-orange-700">
                  ₹{(yearlyTotals.pendingAmount / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-900">
                  ₹{(avgClaimAmount / 1000).toFixed(1)}k
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Expense by Category
        </h2>
        <div className="space-y-2">
          {categoryData.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                  <span className="text-xs text-gray-500 ml-2">({cat.totalClaims} claims)</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">₹{(cat.totalAmount / 100000).toFixed(1)}L</div>
                  <div className="text-xs text-gray-500">{cat.percentageOfTotal}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full"
                  style={{ width: `${cat.percentageOfTotal}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-900">Approved</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">₹{(yearlyTotals.approvedAmount / 10000000).toFixed(2)}Cr</p>
          <p className="text-sm text-green-700 mt-1">{approvalRate}% of total claims</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-900">Rejected</h3>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">₹{(yearlyTotals.rejectedAmount / 100000).toFixed(1)}L</p>
          <p className="text-sm text-red-700 mt-1">{rejectionRate}% of total claims</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-orange-900">Pending</h3>
            <Calendar className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">₹{(yearlyTotals.pendingAmount / 100000).toFixed(1)}L</p>
          <p className="text-sm text-orange-700 mt-1">{Math.round((yearlyTotals.pendingAmount / yearlyTotals.totalAmount) * 100)}% of total claims</p>
        </div>
      </div>
    </div>
  );
}
