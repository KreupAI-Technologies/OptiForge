'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Grid,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Calendar,
  Filter,
  Search,
  Star,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { exportToCsv } from '@/lib/export';
import {
  fetchReportDashboards,
  createReportDashboard,
  type ReportDashboardItem,
} from '@/services/reports-management.service';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  isLocked: boolean;
  isFavorite: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  widgets: Widget[];
  layout: LayoutConfig;
}

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'list';
  title: string;
  data: any;
  config: WidgetConfig;
  position: Position;
  size: Size;
}

interface WidgetConfig {
  chartType?: string;
  color?: string;
  refreshInterval?: number;
  dataSource?: string;
  filters?: any[];
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface LayoutConfig {
  columns: number;
  rows: number;
  gap: number;
}

interface MetricData {
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  trend: number[];
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const categories = ['All', 'Overview', 'Sales', 'Operations', 'Finance', 'Analytics', 'Custom'];

  const widgetTypes = [
    { id: 'metric', name: 'Metric Card', icon: <Target className="w-5 h-5" /> },
    { id: 'chart', name: 'Chart', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'table', name: 'Data Table', icon: <Grid className="w-5 h-5" /> },
    { id: 'gauge', name: 'Gauge', icon: <Activity className="w-5 h-5" /> },
    { id: 'list', name: 'List', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const sampleData = {
    timeSeries: [
      { date: 'Jan', value: 4000, sales: 2400, orders: 150 },
      { date: 'Feb', value: 3000, sales: 1398, orders: 180 },
      { date: 'Mar', value: 2000, sales: 9800, orders: 220 },
      { date: 'Apr', value: 2780, sales: 3908, orders: 200 },
      { date: 'May', value: 1890, sales: 4800, orders: 250 },
      { date: 'Jun', value: 2390, sales: 3800, orders: 280 },
    ],
    pieData: [
      { name: 'Product A', value: 400, color: '#3b82f6' },
      { name: 'Product B', value: 300, color: '#10b981' },
      { name: 'Product C', value: 300, color: '#f59e0b' },
      { name: 'Product D', value: 200, color: '#8b5cf6' },
    ],
    radarData: [
      { subject: 'Quality', A: 120, B: 110, fullMark: 150 },
      { subject: 'Delivery', A: 98, B: 130, fullMark: 150 },
      { subject: 'Cost', A: 86, B: 130, fullMark: 150 },
      { subject: 'Innovation', A: 99, B: 100, fullMark: 150 },
      { subject: 'Service', A: 85, B: 90, fullMark: 150 },
    ],
  };

  useEffect(() => {
    loadDashboards();
  }, []);

  useEffect(() => {
    if (autoRefresh && selectedDashboard) {
      const interval = setInterval(() => {
        handleRefreshDashboard();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedDashboard]);

  const mapToDashboard = (row: ReportDashboardItem): Dashboard => ({
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    category: row.category ?? 'Custom',
    isDefault: !!row.isDefault,
    isLocked: !!row.isLocked,
    isFavorite: !!row.isFavorite,
    createdBy: row.createdByName ?? 'Unknown',
    createdAt: (row.createdAt ?? '').split('T')[0] ?? '',
    lastModified: (row.updatedAt ?? '').split('T')[0] ?? '',
    widgets: [],
    layout: (row.layout as unknown as LayoutConfig) ?? { columns: 12, rows: 8, gap: 16 },
  });

  const loadDashboards = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchReportDashboards();
      const mapped = rows.map(mapToDashboard);
      setDashboards(mapped);
      setSelectedDashboard((prev) =>
        prev ? mapped.find((d) => d.id === prev.id) ?? mapped[0] ?? null : mapped[0] ?? null,
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load dashboards');
      setDashboards([]);
      setSelectedDashboard(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDashboard = () => {
    setIsCreating(true);
  };

  const handleSaveDashboard = async (name: string, description: string, category: string) => {
    try {
      const created = await createReportDashboard({
        name,
        description,
        category,
        createdByName: 'Current User',
        layout: { columns: 12, rows: 8, gap: 16 },
      });
      const mapped = mapToDashboard(created);
      setDashboards((prev) => [...prev, mapped]);
      setSelectedDashboard(mapped);
      setIsCreating(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create dashboard');
    }
  };

  const handleDeleteDashboard = (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      setDashboards(dashboards.filter((d) => d.id !== id));
      if (selectedDashboard?.id === id) {
        setSelectedDashboard(dashboards[0] || null);
      }
    }
  };

  const handleDuplicateDashboard = (dashboard: Dashboard) => {
    const duplicated: Dashboard = {
      ...dashboard,
      id: Date.now().toString(),
      name: `${dashboard.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setDashboards([...dashboards, duplicated]);
  };

  const handleToggleFavorite = (id: string) => {
    setDashboards(
      dashboards.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const handleRefreshDashboard = () => {
    console.log('Refreshing dashboard data...');
  };

  const handleExportDashboard = () => {
    exportToCsv('dashboards', filteredDashboards);
  };

  const handleShareDashboard = () => {
    alert('Sharing dashboard...');
  };

  const renderMetricWidget = (title: string, value: string, change: number, icon: React.ReactNode, color: string, href?: string) => {
    const content = (
      <div className={`bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow ${href ? 'cursor-pointer hover:border-blue-500 border border-transparent' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
          <div className="flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    );

    if (href) {
      return <Link href={href} className="block h-full">{content}</Link>;
    }

    return content;
  };

  const renderChartWidget = (title: string, type: string) => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Settings</span>
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          {type === 'line' ? (
            <LineChart data={sampleData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          ) : type === 'bar' ? (
            <BarChart data={sampleData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
              <Bar dataKey="sales" fill="#10b981" />
            </BarChart>
          ) : type === 'area' ? (
            <AreaChart data={sampleData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="sales" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          ) : type === 'pie' ? (
            <RechartsPie>
              <Pie
                data={sampleData.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sampleData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          ) : (
            <LineChart data={sampleData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTableWidget = (title: string) => {
    const tableData = [
      { id: 1, product: 'Product A', sales: 12500, orders: 145, revenue: '$45,670' },
      { id: 2, product: 'Product B', sales: 10800, orders: 128, revenue: '$38,920' },
      { id: 3, product: 'Product C', sales: 9200, orders: 112, revenue: '$32,450' },
      { id: 4, product: 'Product D', sales: 7500, orders: 98, revenue: '$28,100' },
      { id: 5, product: 'Product E', sales: 6800, orders: 85, revenue: '$24,360' },
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.product}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.sales.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.orders}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderListWidget = (title: string) => {
    const items = [
      { id: 1, text: 'New order #12345 received', time: '5 min ago', type: 'success' },
      { id: 2, text: 'Low stock alert: Product X', time: '15 min ago', type: 'warning' },
      { id: 3, text: 'Production batch completed', time: '1 hour ago', type: 'success' },
      { id: 4, text: 'Quality check failed: Batch #789', time: '2 hours ago', type: 'error' },
      { id: 5, text: 'Shipment dispatched', time: '3 hours ago', type: 'info' },
    ];

    const getIconColor = (type: string) => {
      switch (type) {
        case 'success':
          return 'text-green-500';
        case 'warning':
          return 'text-yellow-500';
        case 'error':
          return 'text-red-500';
        default:
          return 'text-blue-500';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className={getIconColor(item.type)}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{item.text}</p>
                <p className="text-xs text-gray-500 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filteredDashboards = dashboards.filter((dashboard) => {
    const matchesSearch = dashboard.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dashboard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCreateDashboardModal = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Create New Dashboard</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dashboard Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter dashboard name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your dashboard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveDashboard(name, description, category)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full min-h-screen ${isFullscreen ? 'p-0' : 'px-3 py-2'}`}>
      <div className={`mx-auto space-y-3 ${isFullscreen ? 'max-w-full' : 'w-full max-w-full'}`}>
        {!isFullscreen && (
          <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex justify-end items-start gap-2 mb-2">
                <button
                  onClick={handleRefreshDashboard}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handleCreateDashboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Dashboard
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search dashboards..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dashboard List */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">My Dashboards</h2>
              {loadError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loadError}
                </div>
              )}
              {isLoading ? (
                <div className="py-8 text-center text-gray-500">Loading dashboards…</div>
              ) : !loadError && filteredDashboards.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No dashboards found. Create your first dashboard to get started.
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredDashboards.map((dashboard) => (
                  <div
                    key={dashboard.id}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${selectedDashboard?.id === dashboard.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedDashboard(dashboard)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{dashboard.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(dashboard.id);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Star className="w-4 h-4" fill={dashboard.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        {dashboard.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{dashboard.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                        {dashboard.category}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDashboard(dashboard);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateDashboard(dashboard);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!dashboard.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDashboard(dashboard.id);
                            }}
                            className="p-1 hover:bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </>
        )}

        {/* Dashboard View */}
        {selectedDashboard && (
          <div className={`bg-white rounded-lg shadow-sm ${isFullscreen ? 'min-h-screen' : 'p-6'}`}>
            <div className="flex justify-between items-center mb-3 p-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDashboard.name}</h2>
                <p className="text-gray-600 mt-1">{selectedDashboard.description}</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  Auto-refresh ({refreshInterval}s)
                </label>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleShareDashboard}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Share</span>
                </button>
                <button
                  onClick={handleExportDashboard}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Download</span>
                </button>
                {isEditing && (
                  <button
                    onClick={() => setShowWidgetLibrary(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Widget
                  </button>
                )}
              </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
              {/* Metric Widgets */}
              {renderMetricWidget('Total Revenue', '$2,456,789', 12.5, <DollarSign className="w-6 h-6" />, 'bg-green-500', '/reports/finance/revenue-analysis')}
              {renderMetricWidget('Total Orders', '8,542', 8.2, <ShoppingCart className="w-6 h-6" />, 'bg-blue-500', '/reports/sales/orders/status')}
              {renderMetricWidget('Production Output', '45,678', -3.1, <Package className="w-6 h-6" />, 'bg-purple-500', '/reports/production/performance')}
              {renderMetricWidget('Active Users', '3,247', 15.8, <Users className="w-6 h-6" />, 'bg-orange-500', '/reports/crm/customers/acquisition')}
              {renderMetricWidget('System Uptime', '99.8%', 0.2, <Zap className="w-6 h-6" />, 'bg-yellow-500')}
              {renderMetricWidget('Efficiency Rate', '94.2%', 2.3, <Target className="w-6 h-6" />, 'bg-teal-500', '/reports/production/performance')}

              {/* Chart Widgets */}
              <div className="md:col-span-2">
                {renderChartWidget('Revenue Trend', 'line')}
              </div>
              <div>
                {renderChartWidget('Sales Distribution', 'pie')}
              </div>
              <div className="md:col-span-2">
                {renderChartWidget('Monthly Comparison', 'bar')}
              </div>
              <div>
                {renderChartWidget('Growth Analysis', 'area')}
              </div>

              {/* Table Widget */}
              <div className="md:col-span-2">
                {renderTableWidget('Top Products')}
              </div>

              {/* List Widget */}
              <div>
                {renderListWidget('Recent Activities')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Widget Library</h3>
                <button
                  onClick={() => setShowWidgetLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-2">
                {widgetTypes.map((widget) => (
                  <button
                    key={widget.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      {widget.icon}
                    </div>
                    <span className="font-medium">{widget.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Dashboard Modal */}
      {isCreating && renderCreateDashboardModal()}
    </div>
  );
}
