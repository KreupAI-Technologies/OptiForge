'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  TrendingUp,
  Target,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Package,
  Zap,
  Shield,
  Globe,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  Star,
  ChevronRight,
  RefreshCw,
  Settings,
  TrendingDown
} from 'lucide-react'
import {
  CreateSourcingProjectModal,
  AnalyzeSpendModal,
  DevelopStrategyModal,
  TrackImplementationModal
} from '@/components/procurement/StrategicSourcingModals'
import { procurementPagesService } from '@/services/procurement-pages.service'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey
} from 'recharts'

interface SourcingStrategy {
  id: string
  category: string
  status: 'active' | 'planning' | 'review' | 'expired'
  spend: number
  savingsTarget: number
  actualSavings: number
  suppliers: number
  leadSupplier: string
  riskLevel: 'low' | 'medium' | 'high'
  nextReview: string
  strategy: string
  owner: string
}

interface CategorySpend {
  category: string
  current: number
  previous: number
  budget: number
  variance: number
  trend: 'up' | 'down' | 'stable'
}

interface SupplierOpportunity {
  id: string
  supplier: string
  category: string
  opportunityType: string
  potentialSavings: number
  implementation: string
  risk: 'low' | 'medium' | 'high'
  priority: 'high' | 'medium' | 'low'
  status: 'identified' | 'evaluating' | 'implementing' | 'realized'
}

export default function StrategicSourcing() {
  const [activeTab, setActiveTab] = useState('overview')

  // Modal states
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isAnalyzeSpendModalOpen, setIsAnalyzeSpendModalOpen] = useState(false)
  const [isDevelopStrategyModalOpen, setIsDevelopStrategyModalOpen] = useState(false)
  const [isTrackImplementationModalOpen, setIsTrackImplementationModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<SourcingStrategy | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [dateRange, setDateRange] = useState('quarter')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)

  // Sourcing strategies (loaded from API)
  const [strategies, setStrategies] = useState<SourcingStrategy[]>([])

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const data = await procurementPagesService.getStrategicSourcingInsights()
        const events = Array.isArray(data?.events) ? data.events : []

        // Populate insight arrays from API regardless of events length.
        setCategorySpendData(Array.isArray(data?.categorySpendData) ? data.categorySpendData : [])
        setSpendTrendData(Array.isArray(data?.spendTrendData) ? data.spendTrendData : [])
        setOpportunities(Array.isArray(data?.opportunities) ? data.opportunities : [])
        setRiskMatrixData(Array.isArray(data?.riskMatrixData) ? data.riskMatrixData : [])

        if (events.length > 0) {
          const validStatuses = ['active', 'planning', 'review', 'expired']
          const mapped: SourcingStrategy[] = events.map((event: any) => {
            const rawStatus = String(event?.status ?? '').toLowerCase()
            const status = (validStatuses.includes(rawStatus)
              ? rawStatus
              : 'planning') as SourcingStrategy['status']
            const savingsTarget = Number(event?.targetSavings) || 0
            return {
              id: String(event?.id ?? ''),
              category: event?.category ?? event?.title ?? '',
              status,
              spend: Number(event?.estimatedValue) || 0,
              savingsTarget,
              actualSavings: 0,
              suppliers: Number(event?.suppliersInvited) || 0,
              leadSupplier: '',
              riskLevel: 'medium',
              nextReview: '',
              strategy: event?.title ?? '',
              owner: ''
            }
          })

          setStrategies(mapped)
        }
      } catch (error) {
        console.error('Failed to load strategic sourcing insights:', error)
      }
    }

    loadStrategies()
  }, [])

  // Category spend data — wired to real API (categorySpendData from getStrategicSourcingInsights)
  const [categorySpendData, setCategorySpendData] = useState<CategorySpend[]>([])

  // Sourcing opportunities — wired to real API (opportunities from getStrategicSourcingInsights)
  const [opportunities, setOpportunities] = useState<SupplierOpportunity[]>([])

  // Spend trend data — wired to real API (spendTrendData from getStrategicSourcingInsights)
  const [spendTrendData, setSpendTrendData] = useState<
    { month: string; actual: number; budget: number; forecast: number }[]
  >([])

  const supplierConsolidationData = [
    { category: 'Raw Materials', before: 25, after: 12, reduction: 52 },
    { category: 'IT Services', before: 18, after: 8, reduction: 55 },
    { category: 'Logistics', before: 22, after: 15, reduction: 32 },
    { category: 'MRO Supplies', before: 45, after: 25, reduction: 44 },
    { category: 'Professional Services', before: 30, after: 18, reduction: 40 }
  ]

  // Risk matrix data — wired to real API (riskMatrixData from getStrategicSourcingInsights)
  const [riskMatrixData, setRiskMatrixData] = useState<
    { category: string; impact: number; probability: number; value: number }[]
  >([])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              Strategic Sourcing Management
            </h1>
            <p className="text-gray-600 mt-2">Optimize procurement strategies and maximize cost savings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnalyzeSpendModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analyze Spend
            </button>
            <button
              onClick={() => setIsDevelopStrategyModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Develop Strategy
            </button>
            <button
              onClick={() => setIsTrackImplementationModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Track Progress
            </button>
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Total Spend Under Management</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">$15.45M</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">8.2% optimized</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Realized Savings YTD</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">$1.22M</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">108% of target</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">Active Strategies</span>
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-600">6 under review</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Supplier Consolidation</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">43%</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600">185 → 105 suppliers</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Alerts */}
      {showAlerts && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm p-3 border border-purple-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI-Powered Insights</h2>
                <p className="text-sm text-gray-600">Real-time recommendations and predictive analytics</p>
              </div>
            </div>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Critical Alert */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">High Risk: Logistics Suppliers</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    AI predicts 78% probability of price increase in Q2. Consider locking rates now.
                  </p>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunity Alert */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Savings Opportunity: $420K</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Consolidate 8 MRO suppliers to 3 preferred vendors. Projected 18% cost reduction.
                  </p>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    Start Initiative <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Insight */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Performance Excellence</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    IT Services strategy outperforming by 32%. Best practices identified for replication.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Apply Template <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'strategies', 'opportunities', 'analytics', 'risk'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Predictive Analytics Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics Dashboard</h3>
                      <p className="text-sm text-gray-600">AI-powered forecasting and recommendations</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Insights
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Projected Savings (Q2)</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">$1.85M</div>
                    <div className="text-xs text-green-600 mt-1">↑ 22% vs. Q1 forecast</div>
                    <div className="text-xs text-gray-500 mt-1">Confidence: 87%</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-600">Risk Exposure</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">$3.2M</div>
                    <div className="text-xs text-amber-600 mt-1">↑ 15% increase detected</div>
                    <div className="text-xs text-gray-500 mt-1">Action required</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Untapped Opportunities</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">$2.1M</div>
                    <div className="text-xs text-blue-600 mt-1">12 initiatives identified</div>
                    <div className="text-xs text-gray-500 mt-1">Ready to implement</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-600">Optimal Supplier Score</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">8.4/10</div>
                    <div className="text-xs text-purple-600 mt-1">↑ 0.8 improvement</div>
                    <div className="text-xs text-gray-500 mt-1">Above industry avg</div>
                  </div>
                </div>
              </div>

              {/* Spend Trend Analysis */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Spend Trend Analysis</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="month">Monthly</option>
                      <option value="quarter">Quarterly</option>
                      <option value="year">Yearly</option>
                    </select>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="budget" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Performance Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Category Spend Distribution */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Spend Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categorySpendData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="current"
                      >
                        {categorySpendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Supplier Consolidation Progress */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier Consolidation Progress</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={supplierConsolidationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Legend />
                      <Bar dataKey="before" fill="#EF4444" name="Before" />
                      <Bar dataKey="after" fill="#10B981" name="After" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-2">
              {/* Filters */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search strategies by ID, category, owner, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="raw">Raw Materials</option>
                  <option value="it">IT Services</option>
                  <option value="logistics">Logistics</option>
                  <option value="mro">MRO Supplies</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>

              {/* Strategies Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Strategy ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Annual Spend</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Savings Target</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actual Savings</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Performance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Risk</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {strategies
                      .filter((strategy) => {
                        // Apply category filter
                        if (filterCategory !== 'all') {
                          const categoryMap: { [key: string]: string } = {
                            'raw': 'Raw Materials',
                            'it': 'IT Services',
                            'logistics': 'Logistics',
                            'mro': 'MRO Supplies'
                          }
                          if (strategy.category !== categoryMap[filterCategory]) {
                            return false
                          }
                        }

                        // Apply search filter
                        if (searchTerm) {
                          const searchLower = searchTerm.toLowerCase()
                          return (
                            strategy.id.toLowerCase().includes(searchLower) ||
                            strategy.category.toLowerCase().includes(searchLower) ||
                            strategy.owner.toLowerCase().includes(searchLower) ||
                            strategy.leadSupplier.toLowerCase().includes(searchLower) ||
                            strategy.strategy.toLowerCase().includes(searchLower)
                          )
                        }

                        return true
                      })
                      .map((strategy) => (
                      <tr key={strategy.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{strategy.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{strategy.category}</div>
                            <div className="text-sm text-gray-500">{strategy.suppliers} suppliers</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">${(strategy.spend / 1000000).toFixed(2)}M</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-900">${(strategy.savingsTarget / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-green-600">${(strategy.actualSavings / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${Math.min(100, (strategy.actualSavings / strategy.savingsTarget) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((strategy.actualSavings / strategy.savingsTarget) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            strategy.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                            strategy.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {strategy.riskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            strategy.status === 'active' ? 'bg-green-100 text-green-700' :
                            strategy.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                            strategy.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {strategy.status === 'active' && <CheckCircle className="w-3 h-3" />}
                            {strategy.status === 'planning' && <Clock className="w-3 h-3" />}
                            {strategy.status === 'review' && <RefreshCw className="w-3 h-3" />}
                            {strategy.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                              <Edit className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-3">
              {/* Opportunity Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium mb-1">Identified</div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">$1.2M potential</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="text-amber-600 text-sm font-medium mb-1">Evaluating</div>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-sm text-gray-600">$750K potential</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-purple-600 text-sm font-medium mb-1">Implementing</div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">$430K potential</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-green-600 text-sm font-medium mb-1">Realized</div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">$1.22M actual</div>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Active Opportunities</h3>
                {opportunities.map((opp) => (
                  <div key={opp.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-500">{opp.id}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            opp.priority === 'high' ? 'bg-red-100 text-red-700' :
                            opp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {opp.priority} priority
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            opp.status === 'implementing' ? 'bg-purple-100 text-purple-700' :
                            opp.status === 'evaluating' ? 'bg-blue-100 text-blue-700' :
                            opp.status === 'realized' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {opp.status}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{opp.opportunityType}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {opp.supplier}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {opp.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Implementation: {opp.implementation}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${(opp.potentialSavings / 1000).toFixed(0)}K</div>
                        <div className="text-sm text-gray-500">Potential Savings</div>
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          opp.risk === 'low' ? 'bg-green-100 text-green-700' :
                          opp.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {opp.risk} risk
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-3">
              {/* Advanced Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Savings Performance by Quarter */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quarterly Savings Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { quarter: 'Q1 2023', target: 250000, actual: 280000, forecast: 260000 },
                      { quarter: 'Q2 2023', target: 300000, actual: 320000, forecast: 310000 },
                      { quarter: 'Q3 2023', target: 350000, actual: 310000, forecast: 340000 },
                      { quarter: 'Q4 2023', target: 400000, actual: 450000, forecast: 420000 },
                      { quarter: 'Q1 2024', target: 450000, actual: 480000, forecast: 460000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="quarter" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                      <Legend />
                      <Area type="monotone" dataKey="target" stackId="1" stroke="#F59E0B" fill="#FEF3C7" />
                      <Area type="monotone" dataKey="actual" stackId="2" stroke="#10B981" fill="#D1FAE5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Risk Matrix */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Risk Assessment</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={riskMatrixData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="category" stroke="#6B7280" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
                      <Radar name="Impact" dataKey="impact" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                      <Radar name="Probability" dataKey="probability" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Supplier Performance Metrics */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Supplier Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { supplier: 'Global Materials Inc', score: 92, trend: 'up', contracts: 8, spend: 2.3 },
                    { supplier: 'TechPro Solutions', score: 88, trend: 'stable', contracts: 5, spend: 1.8 },
                    { supplier: 'FastTrack Logistics', score: 85, trend: 'up', contracts: 12, spend: 3.1 }
                  ].map((supplier) => (
                    <div key={supplier.supplier} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{supplier.supplier}</h4>
                          <div className="text-sm text-gray-500">{supplier.contracts} active contracts</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{supplier.score}</div>
                          <div className="flex items-center gap-1">
                            {supplier.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : supplier.trend === 'down' ? (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            ) : (
                              <Activity className="w-4 h-4 text-gray-600" />
                            )}
                            <span className="text-xs text-gray-600">Performance</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Annual Spend</span>
                        <span className="font-medium text-gray-900">${supplier.spend}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-3">
              {/* Risk Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-600 text-sm font-medium">High Risk Items</span>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">Immediate attention required</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-600 text-sm font-medium">Medium Risk Items</span>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Monitor closely</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600 text-sm font-medium">Low Risk Items</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">Under control</div>
                </div>
              </div>

              {/* Risk Matrix Visualization */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Impact Matrix</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div></div>
                  <div className="text-center text-sm font-medium text-gray-600">Low Impact</div>
                  <div className="text-center text-sm font-medium text-gray-600">High Impact</div>

                  <div className="text-sm font-medium text-gray-600">High Probability</div>
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 min-h-[120px]">
                    <div className="text-sm font-medium text-yellow-700 mb-2">Medium Risk</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">• MRO Supplies</div>
                      <div className="text-xs text-gray-600">• Office Supplies</div>
                    </div>
                  </div>
                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 min-h-[120px]">
                    <div className="text-sm font-medium text-red-700 mb-2">High Risk</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">• Raw Materials</div>
                      <div className="text-xs text-gray-600">• Logistics</div>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-600">Low Probability</div>
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-h-[120px]">
                    <div className="text-sm font-medium text-green-700 mb-2">Low Risk</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">• Professional Services</div>
                      <div className="text-xs text-gray-600">• Marketing</div>
                    </div>
                  </div>
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 min-h-[120px]">
                    <div className="text-sm font-medium text-yellow-700 mb-2">Medium Risk</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">• IT Services</div>
                      <div className="text-xs text-gray-600">• Facilities</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mitigation Strategies */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Mitigation Strategies</h3>
                <div className="space-y-3">
                  {[
                    { risk: 'Supply Chain Disruption - Raw Materials', strategy: 'Dual sourcing implementation', status: 'in-progress', completion: 65 },
                    { risk: 'Price Volatility - Commodities', strategy: 'Long-term contracts with price caps', status: 'completed', completion: 100 },
                    { risk: 'Supplier Financial Instability', strategy: 'Quarterly financial health monitoring', status: 'active', completion: 80 },
                    { risk: 'Quality Issues - Critical Components', strategy: 'Enhanced QA processes and audits', status: 'planning', completion: 25 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.risk}</div>
                        <div className="text-sm text-gray-600">{item.strategy}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{item.completion}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.completion === 100 ? 'bg-green-500' :
                                item.completion >= 50 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${item.completion}%` }}
                            />
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' :
                          item.status === 'active' || item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Sourcing Modals */}
      <CreateSourcingProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await procurementPagesService.createSourcingStrategy({
              name: data.title || data.name || 'Sourcing Project',
              description: data.objective || data.scope || '',
              category: data.category,
              strategyType: 'sourcing_project',
              status: 'planned',
              targetSavings: Number(data.targetSavings) || 0,
              startDate: data.startDate || null,
              targetDate: data.endDate || null,
              details: data,
            })
            alert('Sourcing project created.')
          } catch (err: any) {
            alert(`Failed to create sourcing project: ${err?.message ?? 'Unknown error'}`)
          } finally {
            setIsCreateProjectModalOpen(false)
          }
        }}
      />

      <AnalyzeSpendModal
        isOpen={isAnalyzeSpendModalOpen}
        onClose={() => setIsAnalyzeSpendModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await procurementPagesService.createSourcingStrategy({
              name: `Spend Analysis - ${data.analysisType || 'category'}`,
              description: `Spend analysis (${data.timeRange || 'ytd'})`,
              strategyType: 'spend_analysis',
              status: 'active',
              details: data,
            })
            alert('Spend analysis saved.')
          } catch (err: any) {
            alert(`Failed to save spend analysis: ${err?.message ?? 'Unknown error'}`)
          } finally {
            setIsAnalyzeSpendModalOpen(false)
          }
        }}
      />

      <DevelopStrategyModal
        isOpen={isDevelopStrategyModalOpen}
        onClose={() => setIsDevelopStrategyModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await procurementPagesService.createSourcingStrategy({
              name: data.title || data.name || data.strategyName || 'Sourcing Strategy',
              description: data.description || data.objective || '',
              category: data.category,
              strategyType: 'strategy',
              status: 'active',
              targetSavings: Number(data.targetSavings) || 0,
              details: data,
            })
            alert('Sourcing strategy saved.')
          } catch (err: any) {
            alert(`Failed to save strategy: ${err?.message ?? 'Unknown error'}`)
          } finally {
            setIsDevelopStrategyModalOpen(false)
          }
        }}
      />

      <TrackImplementationModal
        isOpen={isTrackImplementationModalOpen}
        onClose={() => setIsTrackImplementationModalOpen(false)}
        project={selectedProject}
        onSubmit={async (data) => {
          try {
            const existingId = selectedProject?.id
            if (existingId) {
              await procurementPagesService.updateSourcingStrategy(existingId, {
                strategyType: 'implementation',
                status: data.status || 'in_progress',
                progress: Number(data.progress) || 0,
                achievedSavings: Number(data.achievedSavings) || 0,
                details: data,
              })
            } else {
              await procurementPagesService.createSourcingStrategy({
                name: data.title || data.projectName || 'Implementation Tracking',
                strategyType: 'implementation',
                status: data.status || 'in_progress',
                progress: Number(data.progress) || 0,
                achievedSavings: Number(data.achievedSavings) || 0,
                details: data,
              })
            }
            alert('Implementation progress saved.')
          } catch (err: any) {
            alert(`Failed to save implementation: ${err?.message ?? 'Unknown error'}`)
          } finally {
            setIsTrackImplementationModalOpen(false)
          }
        }}
      />
    </div>
  )
}