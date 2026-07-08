'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Activity,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { fetchReportDataset } from '@/services/reports-management.service';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  production: number;
  inventory: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface PerformanceData {
  category: string;
  current: number;
  target: number;
  previous: number;
}

interface RegionalData {
  region: string;
  sales: number;
  growth: number;
}

interface ProductionMetric {
  time: string;
  efficiency: number;
  output: number;
  downtime: number;
}

interface AnalyticsOverview {
  timeSeriesData?: TimeSeriesData[];
  categoryData?: CategoryData[];
  performanceData?: PerformanceData[];
  regionalData?: RegionalData[];
  productionMetrics?: ProductionMetric[];
}

const DEFAULT_TIME_SERIES: TimeSeriesData[] = [
  { date: '2024-01', revenue: 185000, orders: 520, production: 3200, inventory: 12500 },
  { date: '2024-02', revenue: 198000, orders: 580, production: 3450, inventory: 12800 },
  { date: '2024-03', revenue: 215000, orders: 640, production: 3800, inventory: 13200 },
  { date: '2024-04', revenue: 225000, orders: 690, production: 4100, inventory: 13500 },
  { date: '2024-05', revenue: 238000, orders: 720, production: 4250, inventory: 13800 },
  { date: '2024-06', revenue: 252000, orders: 780, production: 4500, inventory: 14100 },
  { date: '2024-07', revenue: 268000, orders: 820, production: 4750, inventory: 14400 },
  { date: '2024-08', revenue: 285000, orders: 890, production: 5100, inventory: 14700 },
  { date: '2024-09', revenue: 295000, orders: 920, production: 5250, inventory: 15000 },
  { date: '2024-10', revenue: 312000, orders: 980, production: 5500, inventory: 15300 },
];

const DEFAULT_CATEGORY: CategoryData[] = [
  { name: 'Electronics', value: 35, color: '#3b82f6' },
  { name: 'Machinery', value: 25, color: '#8b5cf6' },
  { name: 'Components', value: 20, color: '#10b981' },
  { name: 'Raw Materials', value: 12, color: '#f59e0b' },
  { name: 'Others', value: 8, color: '#6b7280' },
];

const DEFAULT_PERFORMANCE: PerformanceData[] = [
  { category: 'Production', current: 92, target: 95, previous: 88 },
  { category: 'Quality', current: 96, target: 98, previous: 94 },
  { category: 'Delivery', current: 88, target: 90, previous: 85 },
  { category: 'Cost Control', current: 94, target: 92, previous: 91 },
  { category: 'Safety', current: 98, target: 100, previous: 97 },
  { category: 'Innovation', current: 85, target: 88, previous: 82 },
];

const DEFAULT_REGIONAL: RegionalData[] = [
  { region: 'North America', sales: 450000, growth: 12.5 },
  { region: 'Europe', sales: 380000, growth: 8.3 },
  { region: 'Asia Pacific', sales: 520000, growth: 18.7 },
  { region: 'Latin America', sales: 180000, growth: 6.2 },
  { region: 'Middle East', sales: 145000, growth: 15.1 },
  { region: 'Africa', sales: 95000, growth: 9.8 },
];

const DEFAULT_PRODUCTION_METRICS: ProductionMetric[] = [
  { time: '00:00', efficiency: 85, output: 420, downtime: 5 },
  { time: '04:00', efficiency: 88, output: 450, downtime: 3 },
  { time: '08:00', efficiency: 92, output: 520, downtime: 2 },
  { time: '12:00', efficiency: 95, output: 580, downtime: 1 },
  { time: '16:00', efficiency: 93, output: 560, downtime: 2 },
  { time: '20:00', efficiency: 89, output: 490, downtime: 4 },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [overview, setOverview] = useState<AnalyticsOverview>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const payload = await fetchReportDataset<AnalyticsOverview>('analytics.overview');
        if (cancelled) return;
        if (payload) setOverview(payload);
      } catch {
        // keep built-in defaults on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const metrics: (AnalyticsMetric & { href: string })[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$2,456,789',
      change: 12.5,
      changeType: 'increase',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      href: '/reports/finance/revenue-analysis',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: '8,542',
      change: 8.2,
      changeType: 'increase',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-blue-500',
      href: '/reports/sales/orders/status',
    },
    {
      id: 'production',
      title: 'Production Output',
      value: '45,678',
      change: -3.1,
      changeType: 'decrease',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-purple-500',
      href: '/reports/production/performance',
    },
    {
      id: 'customers',
      title: 'Active Customers',
      value: '3,247',
      change: 15.8,
      changeType: 'increase',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500',
      href: '/reports/crm/customers/acquisition',
    },
    {
      id: 'efficiency',
      title: 'Efficiency Rate',
      value: '94.2%',
      change: 2.3,
      changeType: 'increase',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-500',
      href: '/reports/production/performance',
    },
    {
      id: 'fulfillment',
      title: 'Order Fulfillment',
      value: '96.8%',
      change: 1.5,
      changeType: 'increase',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-teal-500',
      href: '/reports/sales/orders/status',
    },
  ];

  const timeSeriesData = Array.isArray(overview.timeSeriesData) ? overview.timeSeriesData : DEFAULT_TIME_SERIES;
  const categoryData = Array.isArray(overview.categoryData) ? overview.categoryData : DEFAULT_CATEGORY;
  const performanceData = Array.isArray(overview.performanceData) ? overview.performanceData : DEFAULT_PERFORMANCE;
  const regionalData = Array.isArray(overview.regionalData) ? overview.regionalData : DEFAULT_REGIONAL;
  const productionMetrics = Array.isArray(overview.productionMetrics) ? overview.productionMetrics : DEFAULT_PRODUCTION_METRICS;

  const handleRefresh = () => {
    // Re-fetch the analytics dataset (handled by the refreshKey effect).
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = () => {
    // Export the current time-series dataset to CSV (client-side).
    exportToCsv('analytics-overview', timeSeriesData);
  };

  const calculateTrend = (data: number[]): string => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const prevAvg = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    if (avg > prevAvg * 1.05) return 'increasing';
    if (avg < prevAvg * 0.95) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedPeriod, selectedMetric]);

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Metrics</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <select
                value={activeChart}
                onChange={(e) => setActiveChart(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="detailed">Detailed</option>
                <option value="comparison">Comparison</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <Link key={metric.id} href={metric.href} className="block">
              <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-500 border border-transparent">
                <div className="flex justify-between items-start mb-2">
                  <div className={`${metric.color} p-3 rounded-lg text-white`}>
                    {metric.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-semibold ${metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                        }`}
                    >
                      {metric.change}%
                    </span>
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Revenue & Orders Trend */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">Revenue & Orders Trend</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg">
                Revenue
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                Orders
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                fill="#3b82f6"
                stroke="#2563eb"
                fillOpacity={0.6}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Product Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Product Category Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Radar */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Performance Metrics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Sales */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Regional Sales Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Production Efficiency */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Production Efficiency (24h)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="output" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">98.5%</div>
              <div className="text-gray-600 mt-1">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">2.4h</div>
              <div className="text-gray-600 mt-1">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">$8.5M</div>
              <div className="text-gray-600 mt-1">Annual Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">156</div>
              <div className="text-gray-600 mt-1">Active Projects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
