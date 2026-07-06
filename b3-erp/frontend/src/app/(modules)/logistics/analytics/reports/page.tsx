'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  Clock,
  Users,
  MapPin,
  Send,
  Share2,
  RefreshCw
} from 'lucide-react';

interface Report {
  id: number;
  reportName: string;
  reportType: string;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on-demand';
  lastGenerated: string;
  generatedBy: string;
  fileSize: string;
  format: 'PDF' | 'Excel' | 'CSV';
  recipients: string[];
  status: 'available' | 'generating' | 'scheduled';
  scheduleTime?: string;
}

interface ReportCategory {
  name: string;
  count: number;
  icon: any;
  color: string;
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      reportName: 'Daily Delivery Performance Report',
      reportType: 'Performance',
      category: 'Delivery',
      description: 'Daily summary of deliveries, on-time performance, and exceptions',
      frequency: 'daily',
      lastGenerated: '2024-10-21 08:00 AM',
      generatedBy: 'System',
      fileSize: '2.3 MB',
      format: 'PDF',
      recipients: ['logistics@company.com', 'operations@company.com'],
      status: 'available',
      scheduleTime: '08:00 AM'
    },
    {
      id: 2,
      reportName: 'Weekly Fleet Utilization Report',
      reportType: 'Utilization',
      category: 'Fleet',
      description: 'Weekly analysis of fleet utilization, idle time, and efficiency metrics',
      frequency: 'weekly',
      lastGenerated: '2024-10-20 06:00 PM',
      generatedBy: 'Admin User',
      fileSize: '4.1 MB',
      format: 'Excel',
      recipients: ['fleet@company.com', 'management@company.com'],
      status: 'available',
      scheduleTime: 'Monday 06:00 PM'
    },
    {
      id: 3,
      reportName: 'Monthly Logistics Spend Report',
      reportType: 'Financial',
      category: 'Spend',
      description: 'Comprehensive monthly spend analysis across all logistics categories',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 09:00 AM',
      generatedBy: 'Finance Team',
      fileSize: '8.7 MB',
      format: 'Excel',
      recipients: ['finance@company.com', 'cfo@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 09:00 AM'
    },
    {
      id: 4,
      reportName: 'Driver Performance Scorecard',
      reportType: 'Performance',
      category: 'Drivers',
      description: 'Individual driver performance metrics, safety records, and KPIs',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 10:00 AM',
      generatedBy: 'HR Manager',
      fileSize: '3.5 MB',
      format: 'PDF',
      recipients: ['hr@company.com', 'operations@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 10:00 AM'
    },
    {
      id: 5,
      reportName: 'Route Optimization Analysis',
      reportType: 'Optimization',
      category: 'Routes',
      description: 'Analysis of route efficiency with optimization recommendations',
      frequency: 'weekly',
      lastGenerated: '2024-10-20 03:00 PM',
      generatedBy: 'System',
      fileSize: '5.2 MB',
      format: 'PDF',
      recipients: ['planning@company.com', 'operations@company.com'],
      status: 'available',
      scheduleTime: 'Sunday 03:00 PM'
    },
    {
      id: 6,
      reportName: 'Customer Delivery Satisfaction Report',
      reportType: 'Customer',
      category: 'Delivery',
      description: 'Customer feedback, ratings, and delivery satisfaction metrics',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 11:00 AM',
      generatedBy: 'Customer Service',
      fileSize: '2.8 MB',
      format: 'Excel',
      recipients: ['service@company.com', 'management@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 11:00 AM'
    },
    {
      id: 7,
      reportName: 'Quarterly Logistics KPI Dashboard',
      reportType: 'KPI',
      category: 'Analytics',
      description: 'Comprehensive quarterly review of all logistics KPIs and trends',
      frequency: 'quarterly',
      lastGenerated: '2024-10-01 12:00 PM',
      generatedBy: 'Executive Team',
      fileSize: '12.4 MB',
      format: 'PDF',
      recipients: ['ceo@company.com', 'coo@company.com', 'management@company.com'],
      status: 'available',
      scheduleTime: '1st of quarter, 12:00 PM'
    },
    {
      id: 8,
      reportName: 'Fuel Consumption & Cost Report',
      reportType: 'Cost Analysis',
      category: 'Fuel',
      description: 'Detailed fuel consumption patterns, costs, and efficiency analysis',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 02:00 PM',
      generatedBy: 'Finance Team',
      fileSize: '4.6 MB',
      format: 'Excel',
      recipients: ['finance@company.com', 'fleet@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 02:00 PM'
    },
    {
      id: 9,
      reportName: 'Vehicle Maintenance & Downtime Report',
      reportType: 'Maintenance',
      category: 'Fleet',
      description: 'Maintenance schedules, costs, and downtime analysis',
      frequency: 'weekly',
      lastGenerated: '2024-10-20 04:00 PM',
      generatedBy: 'Maintenance Team',
      fileSize: '3.9 MB',
      format: 'PDF',
      recipients: ['maintenance@company.com', 'fleet@company.com'],
      status: 'available',
      scheduleTime: 'Friday 04:00 PM'
    },
    {
      id: 10,
      reportName: 'Carrier Performance Comparison',
      reportType: 'Vendor',
      category: 'Carriers',
      description: 'Comparative analysis of carrier performance, costs, and service levels',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 03:00 PM',
      generatedBy: 'Procurement Team',
      fileSize: '6.1 MB',
      format: 'Excel',
      recipients: ['procurement@company.com', 'logistics@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 03:00 PM'
    },
    {
      id: 11,
      reportName: 'On-Time Delivery Trend Analysis',
      reportType: 'Trend',
      category: 'Delivery',
      description: 'Historical trends of on-time delivery performance with forecasting',
      frequency: 'weekly',
      lastGenerated: '2024-10-20 05:00 PM',
      generatedBy: 'Analytics Team',
      fileSize: '3.2 MB',
      format: 'PDF',
      recipients: ['analytics@company.com', 'operations@company.com'],
      status: 'available',
      scheduleTime: 'Sunday 05:00 PM'
    },
    {
      id: 12,
      reportName: 'Load Planning Efficiency Report',
      reportType: 'Efficiency',
      category: 'Planning',
      description: 'Load utilization, planning efficiency, and consolidation opportunities',
      frequency: 'weekly',
      lastGenerated: '2024-10-20 02:00 PM',
      generatedBy: 'Planning Team',
      fileSize: '4.4 MB',
      format: 'Excel',
      recipients: ['planning@company.com', 'operations@company.com'],
      status: 'available',
      scheduleTime: 'Friday 02:00 PM'
    },
    {
      id: 13,
      reportName: 'Executive Logistics Summary',
      reportType: 'Executive',
      category: 'Management',
      description: 'High-level executive summary of key logistics metrics and insights',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 04:00 PM',
      generatedBy: 'Executive Team',
      fileSize: '1.8 MB',
      format: 'PDF',
      recipients: ['ceo@company.com', 'board@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 04:00 PM'
    },
    {
      id: 14,
      reportName: 'Compliance & Safety Report',
      reportType: 'Compliance',
      category: 'Safety',
      description: 'Driver compliance, safety incidents, and regulatory adherence',
      frequency: 'monthly',
      lastGenerated: '2024-10-01 05:00 PM',
      generatedBy: 'Safety Officer',
      fileSize: '5.3 MB',
      format: 'PDF',
      recipients: ['safety@company.com', 'compliance@company.com', 'hr@company.com'],
      status: 'available',
      scheduleTime: '1st of month, 05:00 PM'
    },
    {
      id: 15,
      reportName: 'Ad-Hoc Custom Analysis',
      reportType: 'Custom',
      category: 'Analytics',
      description: 'Custom report generated on-demand based on specific requirements',
      frequency: 'on-demand',
      lastGenerated: '2024-10-18 03:30 PM',
      generatedBy: 'Analytics Team',
      fileSize: '7.2 MB',
      format: 'Excel',
      recipients: ['analytics@company.com'],
      status: 'available'
    }
  ]);

  // `reports` above is a static catalog of report definitions (not live data),
  // so it stays hardcoded. Live delivery/dashboard metrics are fetched into a
  // guarded state for use when KPI slots are added to the JSX.
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [performance, dashboard] = await Promise.all([
          LogisticsService.getDeliveryPerformance(),
          LogisticsService.getLogisticsDashboard(),
        ]);
        if (mounted) setMetrics({ performance, dashboard });
      } catch {
        // Leave metrics as null on error; the catalog UI is unaffected.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const categories: ReportCategory[] = [
    { name: 'Delivery', count: 3, icon: Package, color: 'blue' },
    { name: 'Fleet', count: 2, icon: Truck, color: 'green' },
    { name: 'Drivers', count: 1, icon: Users, color: 'purple' },
    { name: 'Spend', count: 1, icon: DollarSign, color: 'orange' },
    { name: 'Routes', count: 1, icon: MapPin, color: 'red' },
    { name: 'Analytics', count: 2, icon: BarChart3, color: 'indigo' },
    { name: 'Management', count: 1, icon: TrendingUp, color: 'pink' }
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'available': 'text-green-600 bg-green-50 border-green-200',
      'generating': 'text-blue-600 bg-blue-50 border-blue-200',
      'scheduled': 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: { [key: string]: string } = {
      'daily': 'text-purple-600 bg-purple-50',
      'weekly': 'text-blue-600 bg-blue-50',
      'monthly': 'text-green-600 bg-green-50',
      'quarterly': 'text-orange-600 bg-orange-50',
      'yearly': 'text-red-600 bg-red-50',
      'on-demand': 'text-gray-600 bg-gray-50'
    };
    return colors[frequency] || 'text-gray-600 bg-gray-50';
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesFrequency = selectedFrequency === 'all' || report.frequency === selectedFrequency;
    return matchesSearch && matchesCategory && matchesFrequency;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span>Logistics Reports</span>
          </h1>
          <p className="text-gray-600 mt-1">Scheduled and on-demand reports for comprehensive logistics analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Create Custom Report</span>
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className={`bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 rounded-lg p-3 border border-${category.color}-200 cursor-pointer hover:shadow-md transition-shadow`}>
              <div className="flex flex-col items-center text-center">
                <Icon className={`w-8 h-8 text-${category.color}-600 mb-2`} />
                <div className={`text-2xl font-bold text-${category.color}-900`}>{category.count}</div>
                <div className={`text-sm font-medium text-${category.color}-700`}>{category.name}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.name}>{cat.name}</option>
            ))}
            <option value="Fuel">Fuel</option>
            <option value="Carriers">Carriers</option>
            <option value="Planning">Planning</option>
            <option value="Safety">Safety</option>
          </select>

          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="on-demand">On-Demand</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{report.reportName}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFrequencyColor(report.frequency)}`}>
                      {report.frequency.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-indigo-600 bg-indigo-50">
                      {report.reportType}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-teal-600 bg-teal-50">
                      {report.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                <div>
                  <div className="text-gray-600">Last Generated</div>
                  <div className="font-medium text-gray-900">{report.lastGenerated}</div>
                </div>
                <div>
                  <div className="text-gray-600">Generated By</div>
                  <div className="font-medium text-gray-900">{report.generatedBy}</div>
                </div>
                <div>
                  <div className="text-gray-600">File Size</div>
                  <div className="font-medium text-gray-900">{report.fileSize}</div>
                </div>
                <div>
                  <div className="text-gray-600">Format</div>
                  <div className="font-medium text-gray-900">{report.format}</div>
                </div>
              </div>

              {report.scheduleTime && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">
                      <span className="font-medium">Scheduled:</span> {report.scheduleTime}
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-2">
                <div className="text-xs text-gray-600 mb-2">Recipients ({report.recipients.length})</div>
                <div className="flex flex-wrap gap-1">
                  {report.recipients.slice(0, 2).map((recipient, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {recipient}
                    </span>
                  ))}
                  {report.recipients.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      +{report.recipients.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Automated Reporting</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Schedule reports to be automatically generated and distributed to stakeholders on a regular basis.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Daily, weekly, monthly schedules</div>
            <div>• Automatic email distribution</div>
            <div>• Multiple format support</div>
            <div>• Custom recipient lists</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Custom Analytics</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Create custom reports with specific metrics, filters, and visualizations tailored to your needs.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Custom data selection</div>
            <div>• Advanced filtering options</div>
            <div>• Multiple visualization types</div>
            <div>• Export in various formats</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Share2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Report Sharing</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Share reports securely with team members, management, and external stakeholders with access controls.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Secure sharing links</div>
            <div>• Role-based access control</div>
            <div>• Email distribution lists</div>
            <div>• Download permissions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
