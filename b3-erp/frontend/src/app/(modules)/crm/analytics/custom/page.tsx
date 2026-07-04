'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Save,
  Play,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Clock,
  Eye,
  Star,
  Users,
  DollarSign,
  Target,
  Activity,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'table' | 'bar_chart' | 'pie_chart' | 'line_chart' | 'metric_card';
  category: 'sales' | 'customers' | 'revenue' | 'activities' | 'performance' | 'custom';
  dataSource: 'opportunities' | 'customers' | 'contacts' | 'activities' | 'contracts' | 'tickets';
  metrics: string[];
  dimensions: string[];
  filters: {
    field: string;
    operator: string;
    value: string;
  }[];
  dateRange: 'last_7_days' | 'last_30_days' | 'last_quarter' | 'last_year' | 'custom';
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  runCount: number;
  isFavorite: boolean;
  isShared: boolean;
  sharedWith: string[];
  schedule?: 'daily' | 'weekly' | 'monthly' | null;
  status: 'draft' | 'active' | 'archived';
}

export default function CustomReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBuilder, setShowBuilder] = useState(false);

  const reports: CustomReport[] = [
    {
      id: 'RPT-001',
      name: 'Sales Performance by Region',
      description: 'Quarterly sales performance breakdown across all regions with win rate analysis',
      type: 'bar_chart',
      category: 'sales',
      dataSource: 'opportunities',
      metrics: ['Total Revenue', 'Deal Count', 'Win Rate', 'Avg Deal Size'],
      dimensions: ['Region', 'Sales Rep', 'Product'],
      filters: [
        { field: 'status', operator: 'equals', value: 'won' },
        { field: 'stage', operator: 'not_equals', value: 'lost' }
      ],
      dateRange: 'last_quarter',
      createdBy: 'Sarah Johnson',
      createdAt: '2025-08-15',
      lastRun: '2025-10-20',
      runCount: 47,
      isFavorite: true,
      isShared: true,
      sharedWith: ['Sales Team', 'Management'],
      schedule: 'weekly',
      status: 'active'
    },
    {
      id: 'RPT-002',
      name: 'Customer Lifetime Value Analysis',
      description: 'Customer segmentation by LTV with churn risk indicators',
      type: 'pie_chart',
      category: 'customers',
      dataSource: 'customers',
      metrics: ['Customer LTV', 'Total Spend', 'Avg Purchase Value', 'Purchase Frequency'],
      dimensions: ['Customer Segment', 'Industry', 'Company Size'],
      filters: [
        { field: 'status', operator: 'equals', value: 'active' },
        { field: 'ltv', operator: 'greater_than', value: '10000' }
      ],
      dateRange: 'last_year',
      createdBy: 'Michael Chen',
      createdAt: '2025-07-22',
      lastRun: '2025-10-19',
      runCount: 34,
      isFavorite: true,
      isShared: true,
      sharedWith: ['Customer Success', 'Sales Team'],
      schedule: 'monthly',
      status: 'active'
    },
    {
      id: 'RPT-003',
      name: 'Pipeline Velocity Trends',
      description: 'Track how quickly deals move through pipeline stages over time',
      type: 'line_chart',
      category: 'performance',
      dataSource: 'opportunities',
      metrics: ['Avg Days in Stage', 'Stage Conversion Rate', 'Deal Velocity'],
      dimensions: ['Stage', 'Month', 'Sales Rep'],
      filters: [
        { field: 'stage', operator: 'not_equals', value: 'closed_lost' }
      ],
      dateRange: 'last_quarter',
      createdBy: 'Sarah Johnson',
      createdAt: '2025-09-10',
      lastRun: '2025-10-20',
      runCount: 28,
      isFavorite: false,
      isShared: true,
      sharedWith: ['Sales Team'],
      schedule: 'weekly',
      status: 'active'
    },
    {
      id: 'RPT-004',
      name: 'Revenue Attribution by Channel',
      description: 'Revenue breakdown by marketing channel and campaign source',
      type: 'bar_chart',
      category: 'revenue',
      dataSource: 'opportunities',
      metrics: ['Revenue', 'Deal Count', 'Conversion Rate', 'Cost per Acquisition'],
      dimensions: ['Channel', 'Campaign', 'Lead Source'],
      filters: [
        { field: 'status', operator: 'equals', value: 'won' }
      ],
      dateRange: 'last_30_days',
      createdBy: 'Emily Rodriguez',
      createdAt: '2025-09-28',
      lastRun: '2025-10-20',
      runCount: 15,
      isFavorite: true,
      isShared: false,
      sharedWith: [],
      schedule: null,
      status: 'active'
    },
    {
      id: 'RPT-005',
      name: 'Activity Effectiveness Report',
      description: 'Correlation between sales activities and deal outcomes',
      type: 'table',
      category: 'activities',
      dataSource: 'activities',
      metrics: ['Activity Count', 'Response Rate', 'Meeting Conversion', 'Deal Win Rate'],
      dimensions: ['Activity Type', 'Sales Rep', 'Customer Segment'],
      filters: [
        { field: 'activity_type', operator: 'in', value: 'call,email,meeting' }
      ],
      dateRange: 'last_quarter',
      createdBy: 'Michael Chen',
      createdAt: '2025-08-05',
      lastRun: '2025-10-18',
      runCount: 42,
      isFavorite: false,
      isShared: true,
      sharedWith: ['Sales Team', 'Sales Ops'],
      schedule: 'monthly',
      status: 'active'
    },
    {
      id: 'RPT-006',
      name: 'Customer Health Score Dashboard',
      description: 'Real-time customer health indicators with engagement metrics',
      type: 'metric_card',
      category: 'customers',
      dataSource: 'customers',
      metrics: ['Health Score', 'Engagement Score', 'Support Tickets', 'NPS Score'],
      dimensions: ['Customer Segment', 'Account Manager', 'Region'],
      filters: [
        { field: 'status', operator: 'equals', value: 'active' },
        { field: 'health_score', operator: 'less_than', value: '70' }
      ],
      dateRange: 'last_30_days',
      createdBy: 'Sarah Johnson',
      createdAt: '2025-09-15',
      lastRun: '2025-10-20',
      runCount: 22,
      isFavorite: true,
      isShared: true,
      sharedWith: ['Customer Success', 'Management'],
      schedule: 'daily',
      status: 'active'
    },
    {
      id: 'RPT-007',
      name: 'Contract Renewal Forecast',
      description: 'Predictive analysis of upcoming contract renewals and expansion opportunities',
      type: 'table',
      category: 'revenue',
      dataSource: 'contracts',
      metrics: ['Contract Value', 'Renewal Probability', 'Expansion Potential', 'Churn Risk'],
      dimensions: ['Contract Type', 'Customer Segment', 'Renewal Month'],
      filters: [
        { field: 'renewal_date', operator: 'within_next', value: '90_days' }
      ],
      dateRange: 'custom',
      createdBy: 'Emily Rodriguez',
      createdAt: '2025-07-30',
      lastRun: '2025-10-19',
      runCount: 38,
      isFavorite: false,
      isShared: true,
      sharedWith: ['Sales Team', 'Finance'],
      schedule: 'weekly',
      status: 'active'
    },
    {
      id: 'RPT-008',
      name: 'Product Mix Analysis',
      description: 'Revenue contribution and growth trends by product line',
      type: 'pie_chart',
      category: 'sales',
      dataSource: 'opportunities',
      metrics: ['Revenue', 'Units Sold', 'Avg Price', 'Growth Rate'],
      dimensions: ['Product', 'Product Category', 'Region'],
      filters: [
        { field: 'status', operator: 'equals', value: 'won' }
      ],
      dateRange: 'last_year',
      createdBy: 'Michael Chen',
      createdAt: '2025-06-12',
      lastRun: '2025-10-17',
      runCount: 56,
      isFavorite: false,
      isShared: true,
      sharedWith: ['Product Team', 'Sales Team'],
      schedule: 'monthly',
      status: 'active'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Reports',
      value: reports.length,
      change: '+3',
      trend: 'up' as const,
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Active Reports',
      value: reports.filter(r => r.status === 'active').length,
      change: '+2',
      trend: 'up' as const,
      icon: Activity,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Scheduled Reports',
      value: reports.filter(r => r.schedule).length,
      change: '0',
      trend: 'neutral' as const,
      icon: Clock,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Shared Reports',
      value: reports.filter(r => r.isShared).length,
      change: '+1',
      trend: 'up' as const,
      icon: Share2,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return DollarSign;
      case 'customers': return Users;
      case 'revenue': return TrendingUp;
      case 'activities': return Activity;
      case 'performance': return Target;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'bg-blue-100 text-blue-700';
      case 'customers': return 'bg-purple-100 text-purple-700';
      case 'revenue': return 'bg-green-100 text-green-700';
      case 'activities': return 'bg-orange-100 text-orange-700';
      case 'performance': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bar_chart': return BarChart3;
      case 'pie_chart': return PieChart;
      case 'line_chart': return TrendingUp;
      default: return FileText;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className="w-12 h-12 text-white/30" />
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                <span className="text-sm font-medium">{stat.change} this month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Reports</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="sales">Sales</option>
              <option value="customers">Customers</option>
              <option value="revenue">Revenue</option>
              <option value="activities">Activities</option>
              <option value="performance">Performance</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Star className="w-4 h-4 inline mr-1 text-yellow-500" />
                Favorites
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Share2 className="w-4 h-4 inline mr-1 text-blue-500" />
                Shared
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredReports.map((report) => {
          const CategoryIcon = getCategoryIcon(report.category);
          const TypeIcon = getTypeIcon(report.type);

          return (
            <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TypeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                      {report.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
              </div>

              {/* Metrics & Dimensions */}
              <div className="space-y-3 mb-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">METRICS</p>
                  <div className="flex flex-wrap gap-1">
                    {report.metrics.map((metric, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">DIMENSIONS</p>
                  <div className="flex flex-wrap gap-1">
                    {report.dimensions.map((dimension, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                        {dimension}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CategoryIcon className="w-4 h-4 text-gray-400" />
                    <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(report.category)}`}>
                      {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data Source</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                    {report.dataSource.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date Range</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {report.dateRange.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Filters Applied</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {report.filters.length} filter{report.filters.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-4 gap-3 mb-2">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Runs</p>
                  <p className="text-lg font-semibold text-gray-900">{report.runCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Schedule</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {report.schedule || 'Manual'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Last Run</p>
                  <p className="text-sm font-medium text-gray-900">
                    {report.lastRun ? new Date(report.lastRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Shared</p>
                  <p className="text-sm font-medium text-gray-900">
                    {report.isShared ? report.sharedWith.length : 'No'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{report.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <Play className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-purple-600" />
                  </button>
                  <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-green-600" />
                  </button>
                  <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-orange-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  {report.isShared && (
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Builder Modal Placeholder */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3  w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">Report Builder</h2>
              <button
                onClick={() => setShowBuilder(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Report builder interface would include data source selection, metric configuration,
                  dimension selection, filter builder, visualization options, and scheduling settings.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
