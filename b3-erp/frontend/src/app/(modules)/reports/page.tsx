'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSavedReportItems } from '@/services/reports-management.service';
import {
  BarChart3,
  FileText,
  TrendingUp,
  DollarSign,
  Package,
  Factory,
  Users,
  ShoppingCart,
  Clock,
  Calendar,
  Download,
  Eye,
  Settings,
  Filter,
  Search,
} from 'lucide-react';

interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  reportCount: number;
  subcategories?: string[];
}

const reportCategories: ReportCategory[] = [
  {
    id: 'financial',
    name: 'Financial Reports',
    description: 'Comprehensive financial analysis, P&L, balance sheets, and cash flow reports',
    icon: DollarSign,
    color: 'bg-green-500',
    href: '/reports/financial',
    reportCount: 24,
    subcategories: ['P&L Statement', 'Balance Sheet', 'Cash Flow', 'Trial Balance', 'Expense Analysis'],
  },
  {
    id: 'production',
    name: 'Production Reports',
    description: 'Production efficiency, work order status, capacity utilization, and quality metrics',
    icon: Factory,
    color: 'bg-red-500',
    href: '/reports/production',
    reportCount: 18,
    subcategories: ['Work Order Status', 'Capacity Utilization', 'Production Efficiency', 'Quality Metrics'],
  },
  {
    id: 'inventory',
    name: 'Inventory Reports',
    description: 'Stock levels, valuation, movement analysis, and warehouse performance',
    icon: Package,
    color: 'bg-orange-500',
    href: '/reports/inventory',
    reportCount: 16,
    subcategories: ['Stock Valuation', 'Aging Analysis', 'Movement Report', 'Reorder Analysis'],
  },
  {
    id: 'sales',
    name: 'Sales Reports',
    description: 'Sales performance, revenue analysis, customer insights, and order tracking',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    href: '/reports/sales',
    reportCount: 21,
    subcategories: ['Sales Performance', 'Customer Analysis', 'Order Pipeline', 'Revenue Trends'],
  },
  {
    id: 'hr',
    name: 'HR Reports',
    description: 'Employee analytics, attendance tracking, payroll summaries, and performance metrics',
    icon: Users,
    color: 'bg-purple-500',
    href: '/reports/hr',
    reportCount: 15,
    subcategories: ['Attendance', 'Leave Balance', 'Payroll Summary', 'Performance Metrics'],
  },
  {
    id: 'procurement',
    name: 'Procurement Reports',
    description: 'Purchase analysis, vendor performance, PO tracking, and cost savings',
    icon: FileText,
    color: 'bg-indigo-500',
    href: '/reports/procurement',
    reportCount: 12,
    subcategories: ['Purchase Analysis', 'Vendor Performance', 'PO Status', 'Cost Analysis'],
  },
];

const quickReports = [
  { name: 'Today\'s Sales Summary', icon: TrendingUp, color: 'text-green-600 bg-green-50', href: '/reports/sales/today' },
  { name: 'Current Stock Levels', icon: Package, color: 'text-orange-600 bg-orange-50', href: '/reports/inventory/current-stock' },
  { name: 'Active Work Orders', icon: Factory, color: 'text-red-600 bg-red-50', href: '/reports/production/active-wo' },
  { name: 'Pending Approvals', icon: Clock, color: 'text-blue-600 bg-blue-50', href: '/reports/approvals/pending' },
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentReports, setRecentReports] = useState<{ name: string; date: string; user: string; category: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchSavedReportItems();
        const mapped = items.map((r) => ({
          name: r.name,
          date: r.lastRunAt ? new Date(r.lastRunAt).toISOString().slice(0, 10) : '',
          user: r.createdByName ?? '',
          category: r.category ?? '',
        }));
        if (!cancelled) setRecentReports(mapped);
      } catch {
        if (!cancelled) setRecentReports([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCategories = reportCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">
                Generate comprehensive reports and analyze your business data
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Calendar className="w-4 h-4" />
                Schedule Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FileText className="w-4 h-4" />
                Custom Report
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Access Reports */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {quickReports.map((report) => {
              const Icon = report.icon;
              return (
                <Link
                  key={report.name}
                  href={report.href}
                  className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${report.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{report.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Report Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Report Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group bg-white rounded-lg shadow border border-gray-200 hover:shadow-xl transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-2">
                      <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500">
                        {category.reportCount} reports
                      </span>
                    </div>

                    {/* Category Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                      {category.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>

                    {/* Subcategories */}
                    {category.subcategories && (
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.slice(0, 3).map((sub) => (
                          <span
                            key={sub}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            {sub}
                          </span>
                        ))}
                        {category.subcategories.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{category.subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover Effect Bar */}
                  <div className={`h-1 ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Recently Generated</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="divide-y divide-gray-200">
              {recentReports.map((report, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.date}
                        </span>
                        <span>•</span>
                        <span>{report.user}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {report.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Dashboard Link */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics Dashboard</h3>
              <p className="text-blue-100">
                Explore interactive dashboards with real-time data visualization and insights
              </p>
            </div>
            <Link
              href="/reports/dashboards"
              className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              <BarChart3 className="w-5 h-5" />
              View Dashboards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
