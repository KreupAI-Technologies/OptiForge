'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, FileText, TrendingUp, ArrowLeft, Download, Eye, Calendar, Filter } from 'lucide-react';
import { fetchReportCatalog } from '@/services/reports-management.service';

interface FinancialReport {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  lastGenerated?: string;
  href: string;
}

const defaultFinancialReports: FinancialReport[] = [
  { id: '1', name: 'Profit & Loss Statement', description: 'Comprehensive income statement showing revenues and expenses', category: 'Financial Statements', frequency: 'Monthly', lastGenerated: '2025-10-27', href: '/reports/finance/pl' },
  { id: '2', name: 'Balance Sheet', description: 'Statement of financial position - assets, liabilities, and equity', category: 'Financial Statements', frequency: 'Monthly', lastGenerated: '2025-10-27', href: '/reports/finance/balance-sheet' },
  { id: '3', name: 'Cash Flow Statement', description: 'Analysis of cash inflows and outflows', category: 'Financial Statements', frequency: 'Monthly', lastGenerated: '2025-10-26', href: '/reports/finance/cash-flow' },
  { id: '4', name: 'Trial Balance', description: 'Summary of all ledger account balances', category: 'Accounting', frequency: 'Monthly', lastGenerated: '2025-10-27', href: '/reports/finance/trial-balance' },
  { id: '5', name: 'General Ledger Report', description: 'Detailed transactions for all accounts', category: 'Accounting', frequency: 'On-Demand', lastGenerated: '2025-10-25', href: '/reports/finance/general-ledger' },
  { id: '6', name: 'Accounts Receivable Aging', description: 'Outstanding customer invoices by age', category: 'Receivables', frequency: 'Weekly', lastGenerated: '2025-10-27', href: '/reports/finance/ar-aging' },
  { id: '7', name: 'Accounts Payable Aging', description: 'Outstanding vendor bills by age', category: 'Payables', frequency: 'Weekly', lastGenerated: '2025-10-27', href: '/reports/finance/ap-aging' },
  { id: '8', name: 'Revenue Analysis', description: 'Detailed breakdown of revenue by product/service', category: 'Revenue', frequency: 'Monthly', lastGenerated: '2025-10-26', href: '/reports/finance/revenue-analysis' },
  { id: '9', name: 'Expense Analysis', description: 'Categorized expense tracking and trends', category: 'Expenses', frequency: 'Monthly', lastGenerated: '2025-10-26', href: '/reports/finance/expense-analysis' },
  { id: '10', name: 'Budget vs Actual', description: 'Compare actual performance against budget', category: 'Budget', frequency: 'Monthly', lastGenerated: '2025-10-25', href: '/reports/finance/budget-vs-actual' },
  { id: '11', name: 'Cost Center Analysis', description: 'Department-wise cost allocation and analysis', category: 'Cost Accounting', frequency: 'Monthly', href: '/reports/finance/cost-center' },
  { id: '12', name: 'Tax Summary Report', description: 'GST/VAT collection and payment summary', category: 'Tax', frequency: 'Monthly', lastGenerated: '2025-10-20', href: '/reports/finance/tax-summary' },
];

export default function FinancialReportsPage() {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>(defaultFinancialReports);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const items = await fetchReportCatalog('financial');
        if (cancelled) return;
        if (items.length > 0) {
          setFinancialReports(
            items.map((it) => ({
              id: it.id,
              name: it.name,
              description: it.description ?? '',
              category: it.category ?? 'General',
              frequency: it.frequency ?? 'On-Demand',
              lastGenerated: it.lastGenerated ?? undefined,
              href: it.href ?? '/reports/financial',
            })),
          );
        }
      } catch (err) {
        // Fall back to built-in defaults when the catalog endpoint / table
        // is not yet available.
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load catalog');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(financialReports.map(r => r.category)))];

  const filteredReports = financialReports.filter(report => {
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3">
          <Link href="/reports" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-gray-600">Comprehensive financial analysis and accounting reports - click any card to view</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports Grid - NOW CLICKABLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredReports.map((report) => (
            <Link
              key={report.id}
              href={report.href}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-200 overflow-hidden cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                    {report.frequency}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {report.lastGenerated ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.lastGenerated}
                      </span>
                    ) : (
                      <span>Not generated yet</span>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 font-medium group-hover:underline">
                    View Report →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No reports found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
