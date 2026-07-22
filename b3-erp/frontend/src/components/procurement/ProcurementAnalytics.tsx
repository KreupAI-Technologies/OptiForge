'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Package, Users,
  Clock, Target, Activity, PieChart, LineChart as LineChartIcon,
  Calendar, Filter, Download, RefreshCw, Settings,
  ChevronRight, Eye, FileText, Award, AlertCircle,
  ShoppingCart, Zap, Globe, Shield
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ComposedChart, Treemap,
  Sankey, Funnel, FunnelChart
} from 'recharts';

// Import Analytics Modals
import {
  CreateCustomReportModal,
  ExportReportModal,
  ScheduleReportModal,
  DashboardCustomizationModal,
  type ReportConfig,
  type ScheduledReport
} from '@/components/procurement/AnalyticsModals'
import { procurementPagesService } from '@/services/procurement-pages.service'
import {
  procurementReportTemplateService,
  type ProcurementReportTemplate,
} from '@/services/procurement-report-template.service'

interface ProcurementAnalyticsProps {}

const ProcurementAnalytics: React.FC<ProcurementAnalyticsProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedMetric, setSelectedMetric] = useState('spend');
  const [refreshing, setRefreshing] = useState(false);

  // Modal state management
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isScheduleReportModalOpen, setIsScheduleReportModalOpen] = useState(false)
  const [isDashboardCustomizationModalOpen, setIsDashboardCustomizationModalOpen] = useState(false)

  // Saved report templates — persisted via the NestJS procurement report-templates endpoint.
  const [reportTemplates, setReportTemplates] = useState<ProcurementReportTemplate[]>([])
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      const templates = await procurementReportTemplateService.getTemplates('custom-report')
      setReportTemplates(templates)
      setTemplatesError(null)
    } catch (err) {
      setTemplatesError(err instanceof Error ? err.message : 'Failed to load report templates')
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // KPI data — totalSpend / totalOrders / activeSuppliers / avgOrderValue wired
  // from getAnalyticsInsights().kpis. Change/target deltas are not part of the
  // insight payload (needs-backend) and default to 0 until available.
  const [kpiMetrics, setKpiMetrics] = useState({
    totalSpend: 0,
    spendChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    activeSuppliers: 0,
    suppliersChange: 0,
    avgOrderValue: 0,
    orderValueChange: 0,
    savingsAchieved: 0,
    savingsTarget: 0,
    contractCompliance: 0,
    complianceTarget: 0
  });

  // Spend analysis data — wired to real API (spendByCategory from getAnalyticsInsights)
  const [spendByCategory, setSpendByCategory] = useState<
    { category: string; amount: number; percentage: number; trend: string }[]
  >([]);

  // Monthly spend trend — wired to real API (monthlySpendTrend from getAnalyticsInsights)
  const [monthlySpendTrend, setMonthlySpendTrend] = useState<
    { month: string; spend: number; orders: number; avgValue: number }[]
  >([]);

  // Supplier performance data — wired to real API (topVendors from getAnalyticsInsights)
  const [supplierPerformance, setSupplierPerformance] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const insights = await procurementPagesService.getAnalyticsInsights();
        const topVendors = Array.isArray(insights?.topVendors) ? insights.topVendors : [];
        setSupplierPerformance(
          topVendors.map((v: any) => ({
            supplier: v?.vendorName ?? '',
            spend: v?.spend ?? 0,
            orders: v?.orders ?? 0,
            performance: v?.rating ?? 0,
            risk: v?.risk ?? 'low',
          }))
        );
        const k = insights?.kpis ?? {};
        setKpiMetrics((prev) => ({
          ...prev,
          totalSpend: Number(k.totalSpend) || 0,
          totalOrders: Number(k.orderCount) || 0,
          activeSuppliers: Number(k.activeVendors) || 0,
          avgOrderValue: Number(k.avgOrderValue) || 0,
          spendChange: k.spendChange != null ? Number(k.spendChange) || 0 : prev.spendChange,
          ordersChange: k.ordersChange != null ? Number(k.ordersChange) || 0 : prev.ordersChange,
          orderValueChange: k.avgOrderValueChange != null ? Number(k.avgOrderValueChange) || 0 : prev.orderValueChange,
          savingsAchieved: k.savingsAchieved != null ? Number(k.savingsAchieved) || 0 : prev.savingsAchieved,
          savingsTarget: k.savingsTarget != null ? Number(k.savingsTarget) || 0 : prev.savingsTarget,
          contractCompliance: k.contractCompliance != null ? Number(k.contractCompliance) || 0 : prev.contractCompliance,
        }));
        setSpendByCategory(Array.isArray(insights?.spendByCategory) ? insights.spendByCategory : []);
        setMonthlySpendTrend(Array.isArray(insights?.monthlySpendTrend) ? insights.monthlySpendTrend : []);
        setCycleTimeAnalysis(Array.isArray(insights?.cycleTimeAnalysis) ? insights.cycleTimeAnalysis : []);
        setSavingsOpportunities(Array.isArray(insights?.savingsOpportunities) ? insights.savingsOpportunities : []);
        setComplianceMetrics(Array.isArray(insights?.complianceMetrics) ? insights.complianceMetrics : []);
      } catch {
        setSupplierPerformance([]);
      }
    })();
  }, []);

  // Procurement cycle time data — wired to real API (cycleTimeAnalysis from getAnalyticsInsights)
  const [cycleTimeAnalysis, setCycleTimeAnalysis] = useState<
    { stage: string; avgDays: number; target: number; efficiency: number }[]
  >([]);

  // Cost savings opportunities — wired to real API (savingsOpportunities from getAnalyticsInsights)
  const [savingsOpportunities, setSavingsOpportunities] = useState<
    { opportunity: string; potential: number; difficulty: 'low' | 'medium' | 'high'; timeline: string }[]
  >([]);

  // Compliance metrics — wired to real API (complianceMetrics from getAnalyticsInsights)
  const [complianceMetrics, setComplianceMetrics] = useState<
    { metric: string; score: number; target: number; status: 'good' | 'warning' | 'critical' }[]
  >([]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const renderOverview = () => (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <span className={`flex items-center text-sm ${kpiMetrics.spendChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {kpiMetrics.spendChange >= 0 ? <ArrowUp /> : <ArrowDown />}
              {Math.abs(kpiMetrics.spendChange)}%
            </span>
          </div>
          <p className="text-2xl font-bold">${(kpiMetrics.totalSpend / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-gray-600">Total Spend</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="h-8 w-8 text-green-500" />
            <span className={`flex items-center text-sm ${kpiMetrics.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpiMetrics.ordersChange >= 0 ? <ArrowUp /> : <ArrowDown />}
              {Math.abs(kpiMetrics.ordersChange)}%
            </span>
          </div>
          <p className="text-2xl font-bold">{kpiMetrics.totalOrders.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-purple-500" />
            <span className={`flex items-center text-sm ${kpiMetrics.suppliersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpiMetrics.suppliersChange >= 0 ? <ArrowUp /> : <ArrowDown />}
              {Math.abs(kpiMetrics.suppliersChange)}%
            </span>
          </div>
          <p className="text-2xl font-bold">{kpiMetrics.activeSuppliers}</p>
          <p className="text-sm text-gray-600">Active Suppliers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">
              {((kpiMetrics.savingsAchieved / kpiMetrics.savingsTarget) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold">${(kpiMetrics.savingsAchieved / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Savings Achieved</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Spend Trend */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Spend Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlySpendTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="spend" fill="#3B82F6" name="Monthly Spend ($)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" name="Orders" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Spend by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={spendByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {spendByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'][index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Top Suppliers by Spend</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Supplier</th>
                <th className="text-left py-2">Total Spend</th>
                <th className="text-left py-2">Orders</th>
                <th className="text-left py-2">Performance</th>
                <th className="text-left py-2">Risk Level</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplierPerformance.map((supplier, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{supplier.supplier}</td>
                  <td className="py-2">${(supplier.spend / 1000).toFixed(0)}K</td>
                  <td className="py-2">{supplier.orders}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            supplier.performance >= 95 ? 'bg-green-500' :
                            supplier.performance >= 90 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${supplier.performance}%` }}
                        />
                      </div>
                      <span className="text-sm">{supplier.performance}%</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      supplier.risk === 'low' ? 'bg-green-100 text-green-800' :
                      supplier.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {supplier.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSpendAnalysis = () => (
    <div className="space-y-3">
      {/* Spend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-sm text-gray-600 mb-1">Direct Spend</p>
          <p className="text-xl font-bold">$1.8M</p>
          <p className="text-xs text-green-600">73.5% of total</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-sm text-gray-600 mb-1">Indirect Spend</p>
          <p className="text-xl font-bold">$650K</p>
          <p className="text-xs text-blue-600">26.5% of total</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-sm text-gray-600 mb-1">Contracted Spend</p>
          <p className="text-xl font-bold">$2.1M</p>
          <p className="text-xs text-green-600">85.7% coverage</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-sm text-gray-600 mb-1">Maverick Spend</p>
          <p className="text-xl font-bold">$208K</p>
          <p className="text-xs text-red-600">8.5% of total</p>
        </div>
      </div>

      {/* Spend Waterfall Analysis */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Year-over-Year Spend Analysis</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[
            { name: 'Last Year', value: 2200000, fill: '#6B7280' },
            { name: 'Price Increase', value: 180000, fill: '#EF4444' },
            { name: 'Volume Growth', value: 220000, fill: '#EF4444' },
            { name: 'New Categories', value: 150000, fill: '#EF4444' },
            { name: 'Savings', value: -125000, fill: '#10B981' },
            { name: 'Efficiency', value: -75000, fill: '#10B981' },
            { name: 'Negotiation', value: -100000, fill: '#10B981' },
            { name: 'This Year', value: 2450000, fill: '#3B82F6' }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value: any) => `$${(Math.abs(value) / 1000000).toFixed(2)}M`} />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Spend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Spend by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { department: 'Manufacturing', spend: 980000 },
              { department: 'R&D', spend: 450000 },
              { department: 'Operations', spend: 380000 },
              { department: 'IT', spend: 290000 },
              { department: 'Admin', spend: 180000 },
              { department: 'Marketing', spend: 170000 }
            ]} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="department" type="category" />
              <Tooltip formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
              <Bar dataKey="spend" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Spend Velocity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { week: 'W1', planned: 450000, actual: 480000 },
              { week: 'W2', planned: 460000, actual: 445000 },
              { week: 'W3', planned: 470000, actual: 490000 },
              { week: 'W4', planned: 480000, actual: 475000 },
              { week: 'W5', planned: 490000, actual: 510000 },
              { week: 'W6', planned: 500000, actual: 495000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="planned" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Planned" />
              <Area type="monotone" dataKey="actual" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spend Cube Analysis */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Multi-Dimensional Spend Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <h4 className="font-medium mb-3">By Payment Terms</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Net 30</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="text-sm">$1.6M</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Net 45</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                  <span className="text-sm">$613K</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Net 60</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                  <span className="text-sm">$245K</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">By Geography</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Domestic</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                  <span className="text-sm">$1.7M</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">International</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                  <span className="text-sm">$735K</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Local</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }} />
                  </div>
                  <span className="text-sm">$123K</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">By Contract Type</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fixed Price</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '55%' }} />
                  </div>
                  <span className="text-sm">$1.3M</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Volume Based</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }} />
                  </div>
                  <span className="text-sm">$858K</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Spot Buy</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                  <span className="text-sm">$245K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-3">
      {/* Cycle Time Analysis */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Procurement Cycle Time Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cycleTimeAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgDays" fill="#3B82F6" name="Average Days" />
            <Bar dataKey="target" fill="#10B981" name="Target Days" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-6">
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Total Cycle Time</p>
            <p className="text-2xl font-bold">22.5 days</p>
            <p className="text-xs text-red-600">3.5 days above target</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Fastest Process</p>
            <p className="text-2xl font-bold">12 days</p>
            <p className="text-xs text-green-600">Best in class</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Process Efficiency</p>
            <p className="text-2xl font-bold">76%</p>
            <p className="text-xs text-yellow-600">Room for improvement</p>
          </div>
        </div>
      </div>

      {/* KPI Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">KPI Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { metric: 'Cost Savings', actual: 83, target: 100 },
              { metric: 'Quality', actual: 95, target: 98 },
              { metric: 'Delivery', actual: 92, target: 95 },
              { metric: 'Service', actual: 88, target: 90 },
              { metric: 'Innovation', actual: 75, target: 85 },
              { metric: 'Sustainability', actual: 70, target: 80 }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Actual" dataKey="actual" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Compliance Metrics</h3>
          <div className="space-y-2">
            {complianceMetrics.map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{metric.score}%</span>
                    <span className={`w-2 h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: {metric.target}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Efficiency */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Process Automation Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${0.75 * 251.33} 251.33`}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">75%</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium">Automated Processes</p>
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${0.45 * 251.33} 251.33`}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">45%</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium">Time Saved</p>
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${0.92 * 251.33} 251.33`}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">92%</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium">Error Reduction</p>
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#8B5CF6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${0.88 * 251.33} 251.33`}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">88%</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium">User Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavings = () => (
    <div className="space-y-3">
      {/* Savings Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
          <Zap className="h-8 w-8 mb-2" />
          <p className="text-sm opacity-90">YTD Savings Achieved</p>
          <p className="text-3xl font-bold">${(kpiMetrics.savingsAchieved / 1000).toFixed(0)}K</p>
          <div className="mt-2">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${(kpiMetrics.savingsAchieved / kpiMetrics.savingsTarget) * 100}%` }}
              />
            </div>
            <p className="text-xs mt-1">
              {((kpiMetrics.savingsAchieved / kpiMetrics.savingsTarget) * 100).toFixed(0)}% of target
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <Target className="h-8 w-8 mb-2" />
          <p className="text-sm opacity-90">Identified Opportunities</p>
          <p className="text-3xl font-bold">$235K</p>
          <p className="text-xs mt-2">Across 15 initiatives</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <TrendingUp className="h-8 w-8 mb-2" />
          <p className="text-sm opacity-90">Projected Annual</p>
          <p className="text-3xl font-bold">$280K</p>
          <p className="text-xs mt-2">Based on current run rate</p>
        </div>
      </div>

      {/* Savings Opportunities */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Savings Opportunities Pipeline</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Opportunity
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Opportunity</th>
                <th className="text-left py-2">Potential Savings</th>
                <th className="text-left py-2">Difficulty</th>
                <th className="text-left py-2">Timeline</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {savingsOpportunities.map((opp, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{opp.opportunity}</td>
                  <td className="py-2 font-semibold">${(opp.potential / 1000).toFixed(0)}K</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      opp.difficulty === 'low' ? 'bg-green-100 text-green-800' :
                      opp.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {opp.difficulty.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">{opp.timeline}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      In Review
                    </span>
                  </td>
                  <td className="py-2">
                    <button className="text-blue-600 hover:text-blue-800">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Savings by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { category: 'Negotiation', achieved: 45000, potential: 15000 },
              { category: 'Volume Disc.', achieved: 38000, potential: 22000 },
              { category: 'Substitution', achieved: 22000, potential: 18000 },
              { category: 'Process Opt.', achieved: 15000, potential: 25000 },
              { category: 'Demand Mgmt', achieved: 5000, potential: 30000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="achieved" stackId="a" fill="#10B981" name="Achieved" />
              <Bar dataKey="potential" stackId="a" fill="#3B82F6" name="Potential" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <h3 className="text-lg font-semibold mb-2">Monthly Savings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', target: 20000, actual: 18500 },
              { month: 'Feb', target: 20000, actual: 21200 },
              { month: 'Mar', target: 20000, actual: 19800 },
              { month: 'Apr', target: 21000, actual: 22500 },
              { month: 'May', target: 21000, actual: 20800 },
              { month: 'Jun', target: 21000, actual: 21700 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="target" stroke="#6B7280" strokeDasharray="5 5" name="Target" />
              <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Initiatives Tracker */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold mb-2">Active Savings Initiatives</h3>
        <div className="space-y-2">
          <div className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">Supplier Consolidation Program</h4>
                <p className="text-sm text-gray-600">Reduce supplier base by 20% to leverage volume</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                ON TRACK
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div>
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="text-sm">65%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Savings to Date</p>
                <p className="text-sm font-semibold">$28.5K</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Est. Completion</p>
                <p className="text-sm">Mar 2025</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">Payment Terms Optimization</h4>
                <p className="text-sm text-gray-600">Negotiate early payment discounts with key suppliers</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                IN PROGRESS
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div>
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <span className="text-sm">40%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Savings to Date</p>
                <p className="text-sm font-semibold">$12.3K</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Est. Completion</p>
                <p className="text-sm">Feb 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Plus = ({ className = "" }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const ArrowUp = ({ className = "" }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );

  const ArrowDown = ({ className = "" }: { className?: string }) => (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );

  // ---- Report template persistence (custom report + schedule saved to backend) ----
  const handleSaveCustomReport = async (data: ReportConfig) => {
    const name = data.reportName?.trim() || window.prompt('Report name')?.trim()
    if (!name) return
    try {
      await procurementReportTemplateService.createTemplate({
        name,
        reportType: 'custom-report',
        description: data.description || undefined,
        config: data,
      })
      await loadTemplates()
      setIsCreateReportModalOpen(false)
    } catch (err) {
      setTemplatesError(err instanceof Error ? err.message : 'Failed to save report template')
    }
  }

  const handleSaveScheduledReport = async (data: ScheduledReport) => {
    const name = data.reportName?.trim() || window.prompt('Scheduled report name')?.trim()
    if (!name) return
    try {
      await procurementReportTemplateService.createTemplate({
        name,
        reportType: 'custom-report',
        config: data,
        schedule: data.frequency || undefined,
      })
      await loadTemplates()
      setIsScheduleReportModalOpen(false)
    } catch (err) {
      setTemplatesError(err instanceof Error ? err.message : 'Failed to save scheduled report')
    }
  }

  // ---- Client-side artifact helpers (CSV/JSON export runs entirely in-browser) ----
  const triggerDownload = (filename: string, mime: string, content: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = (prefix: string, data: unknown) => {
    triggerDownload(`${prefix}-${Date.now()}.json`, 'application/json', JSON.stringify(data, null, 2));
  };

  const exportAnalyticsData = (_options: unknown) => {
    const header = 'Category,Amount,Percentage,Trend';
    const rows = spendByCategory.map((c) => [c.category, c.amount, c.percentage, c.trend].join(','));
    triggerDownload(`procurement-analytics-${Date.now()}.csv`, 'text/csv', [header, ...rows].join('\n'));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Procurement Analytics Dashboard</h2>
            <p className="text-gray-600">Real-time insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="lastyear">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button
              onClick={handleRefresh}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsCreateReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Create Report</span>
            </button>
            <button
              onClick={() => setIsScheduleReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Schedule</span>
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Export</span>
            </button>
            <button
              onClick={() => setIsDashboardCustomizationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Customize</span>
            </button>
          </div>
        </div>

        {/* Saved report templates (persisted via backend) */}
        <div className="mt-3">
          {templatesError ? (
            <p className="text-sm text-red-600">{templatesError}</p>
          ) : reportTemplates.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">
                Saved report templates ({reportTemplates.length}):
              </span>
              {reportTemplates.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  <FileText className="h-3 w-3" />
                  {t.name}
                  {t.schedule ? ` · ${t.schedule}` : ''}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No saved report templates yet. Use Create Report or Schedule to save one.
            </p>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'spend-analysis', 'performance', 'savings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'spend-analysis' && renderSpendAnalysis()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'savings' && renderSavings()}

      {/* Analytics Modals */}
      <CreateCustomReportModal
        isOpen={isCreateReportModalOpen}
        onClose={() => setIsCreateReportModalOpen(false)}
        onSubmit={(data) => {
          void handleSaveCustomReport(data)
        }}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={(options) => {
          exportAnalyticsData(options)
          setIsExportModalOpen(false)
        }}
      />

      <ScheduleReportModal
        isOpen={isScheduleReportModalOpen}
        onClose={() => setIsScheduleReportModalOpen(false)}
        onSubmit={(data) => {
          void handleSaveScheduledReport(data)
        }}
      />

      <DashboardCustomizationModal
        isOpen={isDashboardCustomizationModalOpen}
        onClose={() => setIsDashboardCustomizationModalOpen(false)}
        onSubmit={(data) => {
          downloadJson('procurement-dashboard-layout', data)
          setIsDashboardCustomizationModalOpen(false)
        }}
      />
    </div>
  );
};

export default ProcurementAnalytics;