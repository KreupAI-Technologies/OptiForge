'use client'

import React, { useState, useEffect } from 'react'
import { procurementVendorScorecardService } from '@/services/procurement-vendor-scorecard.service'
import {
  Award,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  Target,
  Users,
  Package,
  Truck,
  Shield,
  DollarSign,
  FileText,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Download,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Settings,
  Eye,
  Edit,
  MessageSquare,
  PieChart,
  GitCompare,
  RefreshCw,
  Plus,
  Award as Trophy,
  Medal,
  Badge
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'

interface SupplierScore {
  supplierId: string
  supplierName: string
  category: string
  overallScore: number
  qualityScore: number
  deliveryScore: number
  priceScore: number
  serviceScore: number
  innovationScore: number
  sustainabilityScore: number
  trend: 'up' | 'down' | 'stable'
  rank: number
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  lastEvaluation: string
}

interface PerformanceMetric {
  metric: string
  weight: number
  target: number
  actual: number
  score: number
  trend: 'improving' | 'declining' | 'stable'
}

export default function SupplierScorecard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierScore | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('quarter')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true)
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')


  // Handler functions (simplified)
  const handleRefresh = () => {
    console.log('Refreshing supplier scorecard data...')
    alert('Refreshing Supplier Scorecard - Updating performance scores, rankings, and tier assignments.')
  }

  const handleSettings = () => {
    console.log('Opening scorecard settings...')
    alert('Supplier Scorecard Settings - Configure scoring weights, tier thresholds, evaluation frequency, and data sources.')
  }

  const handleExport = () => {
    console.log('Exporting supplier scorecard report...')
    alert('Exporting Supplier Scorecard Report - This would generate a comprehensive Excel report with scores, rankings, and trends.')
  }

  const handleViewSupplierDetails = (supplier: SupplierScore) => {
    console.log('Viewing supplier details:', supplier.supplierId)
    alert(`Supplier Details: ${supplier.supplierName} - Score: ${supplier.overallScore}/100, Tier: ${supplier.tier.toUpperCase()}, Rank: #${supplier.rank}`)
  }

  const handleEditWeights = () => {
    console.log('Opening weight editor...')
    alert('Edit Scorecard Weights - This would allow customization of scoring weights for quality, delivery, price, service, innovation, and sustainability.')
  }

  const handleRecalculateScores = () => {
    console.log('Recalculating supplier scores...')
    alert('Recalculating Supplier Scores - This would pull latest data and recalculate all supplier scores and rankings.')
  }

  const handleCompareSuppliers = () => {
    if (!comparisonMode) {
      alert('Supplier Comparison Mode - Select 2-5 suppliers to compare their performance side-by-side.')
    } else {
      alert('Compare Selected Suppliers - This would show a detailed comparison of selected suppliers.')
    }
    setComparisonMode(!comparisonMode)
  }

  const handleViewTrends = (supplier: SupplierScore) => {
    console.log('Viewing performance trends for:', supplier.supplierId)
    alert(`Performance Trends: ${supplier.supplierName} - Trend: ${supplier.trend.toUpperCase()}. This would show historical performance data.`)
  }

  const handleCreateAction = () => {
    console.log('Creating improvement action...')
    alert('Create Supplier Improvement Action - This would open a form to create improvement actions for underperforming suppliers.')
  }

  const handleViewBenchmarks = () => {
    console.log('Viewing industry benchmarks...')
    alert('Industry Benchmark Analysis - This would show how your supplier base compares to industry standards.')
  }

  const handleScheduleReview = (supplier: SupplierScore) => {
    console.log('Scheduling supplier review for:', supplier.supplierId)
    alert(`Schedule Business Review: ${supplier.supplierName} - This would open a scheduling dialog for supplier review meetings.`)
  }

  const handleExportSupplierReport = (supplier: SupplierScore) => {
    console.log('Exporting individual supplier report:', supplier.supplierId)
    alert(`Export Report: ${supplier.supplierName} - This would generate a detailed PDF/Excel report for this supplier.`)
  }

  // Mock data
  const MOCK_SUPPLIER_SCORES: SupplierScore[] = [
    {
      supplierId: 'SUP001',
      supplierName: 'Global Tech Solutions',
      category: 'IT Services',
      overallScore: 92,
      qualityScore: 95,
      deliveryScore: 88,
      priceScore: 90,
      serviceScore: 94,
      innovationScore: 92,
      sustainabilityScore: 85,
      trend: 'up',
      rank: 1,
      tier: 'platinum',
      lastEvaluation: '2024-02-15'
    },
    {
      supplierId: 'SUP002',
      supplierName: 'Premier Manufacturing Co',
      category: 'Raw Materials',
      overallScore: 88,
      qualityScore: 90,
      deliveryScore: 85,
      priceScore: 88,
      serviceScore: 86,
      innovationScore: 82,
      sustainabilityScore: 90,
      trend: 'stable',
      rank: 2,
      tier: 'gold',
      lastEvaluation: '2024-02-10'
    },
    {
      supplierId: 'SUP003',
      supplierName: 'Express Logistics Ltd',
      category: 'Logistics',
      overallScore: 85,
      qualityScore: 82,
      deliveryScore: 92,
      priceScore: 85,
      serviceScore: 88,
      innovationScore: 78,
      sustainabilityScore: 80,
      trend: 'up',
      rank: 3,
      tier: 'gold',
      lastEvaluation: '2024-02-12'
    },
    {
      supplierId: 'SUP004',
      supplierName: 'Quality Components Inc',
      category: 'Components',
      overallScore: 78,
      qualityScore: 85,
      deliveryScore: 75,
      priceScore: 82,
      serviceScore: 72,
      innovationScore: 70,
      sustainabilityScore: 75,
      trend: 'down',
      rank: 8,
      tier: 'silver',
      lastEvaluation: '2024-02-08'
    }
  ]

  const [supplierScores, setSupplierScores] = useState<SupplierScore[]>(MOCK_SUPPLIER_SCORES)

  useEffect(() => {
    let cancelled = false
    const tierMap: Record<string, SupplierScore['tier']> = {
      PLATINUM: 'platinum', GOLD: 'gold', SILVER: 'silver', BRONZE: 'bronze',
    }
    const load = async () => {
      try {
        const raw = await procurementVendorScorecardService.getScorecards()
        if (!cancelled && Array.isArray(raw) && raw.length) {
          setSupplierScores(raw.map((s: any, idx: number): SupplierScore => ({
            supplierId: s.vendorId ?? s.supplierId ?? s.id ?? `SUP${idx + 1}`,
            supplierName: s.vendorName ?? s.supplierName ?? '—',
            category: s.category ?? '—',
            overallScore: Number(s.overallScore ?? s.totalScore ?? 0),
            qualityScore: Number(s.qualityScore ?? 0),
            deliveryScore: Number(s.deliveryScore ?? 0),
            priceScore: Number(s.priceScore ?? s.costScore ?? 0),
            serviceScore: Number(s.serviceScore ?? 0),
            innovationScore: Number(s.innovationScore ?? 0),
            sustainabilityScore: Number(s.sustainabilityScore ?? 0),
            trend: (String(s.trend ?? 'stable').toLowerCase() as SupplierScore['trend']),
            rank: Number(s.rank ?? idx + 1),
            tier: tierMap[String(s.tier ?? '').toUpperCase()] ?? 'bronze',
            lastEvaluation: (s.lastEvaluation ?? s.evaluationDate ?? '').toString().slice(0, 10),
          })))
        }
      } catch {
        // keep sample data on error
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const performanceMetrics: PerformanceMetric[] = [
    { metric: 'Quality', weight: 25, target: 90, actual: 88, score: 97.8, trend: 'improving' },
    { metric: 'On-time Delivery', weight: 20, target: 95, actual: 92, score: 96.8, trend: 'stable' },
    { metric: 'Price Competitiveness', weight: 20, target: 85, actual: 87, score: 102.4, trend: 'improving' },
    { metric: 'Service & Support', weight: 15, target: 90, actual: 86, score: 95.6, trend: 'declining' },
    { metric: 'Innovation', weight: 10, target: 80, actual: 78, score: 97.5, trend: 'stable' },
    { metric: 'Sustainability', weight: 10, target: 85, actual: 82, score: 96.5, trend: 'improving' }
  ]

  const scorecardHistory = [
    { quarter: 'Q1 2023', quality: 85, delivery: 88, price: 84, service: 82, overall: 85 },
    { quarter: 'Q2 2023', quality: 86, delivery: 89, price: 85, service: 84, overall: 86 },
    { quarter: 'Q3 2023', quality: 88, delivery: 90, price: 86, service: 85, overall: 87 },
    { quarter: 'Q4 2023', quality: 89, delivery: 91, price: 87, service: 86, overall: 88 },
    { quarter: 'Q1 2024', quality: 90, delivery: 92, price: 88, service: 88, overall: 90 }
  ]

  const kpiDetails = [
    { kpi: 'Defect Rate', value: '0.8%', target: '<1%', status: 'good' },
    { kpi: 'Return Rate', value: '1.2%', target: '<2%', status: 'good' },
    { kpi: 'On-Time Delivery', value: '94.5%', target: '>95%', status: 'warning' },
    { kpi: 'Lead Time Variance', value: '±2 days', target: '±1 day', status: 'warning' },
    { kpi: 'Invoice Accuracy', value: '99.2%', target: '>98%', status: 'good' },
    { kpi: 'Response Time', value: '2.5 hrs', target: '<4 hrs', status: 'good' },
    { kpi: 'Cost Savings', value: '8.5%', target: '>5%', status: 'good' },
    { kpi: 'Contract Compliance', value: '96%', target: '>95%', status: 'good' }
  ]

  const categoryBenchmarks = [
    { category: 'IT Services', avgScore: 85, topScore: 92, yourScore: 92 },
    { category: 'Raw Materials', avgScore: 82, topScore: 90, yourScore: 88 },
    { category: 'Logistics', avgScore: 80, topScore: 88, yourScore: 85 },
    { category: 'Components', avgScore: 78, topScore: 85, yourScore: 78 },
    { category: 'Professional Services', avgScore: 83, topScore: 91, yourScore: 86 }
  ]

  const improvementActions = [
    { supplier: 'Quality Components Inc', issue: 'Delivery delays', action: 'Implement buffer stock', priority: 'high', status: 'in_progress' },
    { supplier: 'Express Logistics Ltd', issue: 'Documentation errors', action: 'Process training', priority: 'medium', status: 'planned' },
    { supplier: 'Premier Manufacturing Co', issue: 'Quality variations', action: 'Enhanced QC process', priority: 'high', status: 'completed' },
    { supplier: 'Global Tech Solutions', issue: 'Response time', action: 'Dedicated account manager', priority: 'low', status: 'in_progress' }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-gray-400 to-gray-600'
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600'
      default: return 'bg-gray-400'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Trophy className="w-5 h-5 text-white" />
      case 'gold': return <Medal className="w-5 h-5 text-white" />
      case 'silver': return <Award className="w-5 h-5 text-white" />
      case 'bronze': return <Badge className="w-5 h-5 text-white" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-600" />
              Supplier Performance Scorecard
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive supplier performance evaluation and benchmarking</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewBenchmarks}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              title="View Industry Benchmarks"
            >
              <PieChart className="w-4 h-4" />
              Benchmarks
            </button>
            <button
              onClick={handleEditWeights}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              title="Edit Scorecard Weights"
            >
              <Settings className="w-4 h-4" />
              Edit Weights
            </button>
            <button
              onClick={handleCreateAction}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
              title="Create Improvement Action"
            >
              <Plus className="w-4 h-4" />
              New Action
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title="Export Scorecard Report"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleSettings}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              title="Scorecard Settings"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleRecalculateScores}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              title="Recalculate All Scores"
            >
              <RefreshCw className="w-4 h-4" />
              Update Scores
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Average Score</span>
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">85.8</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+2.3 pts</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Top Performers</span>
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Score ≥90</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">Need Improvement</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="text-sm text-gray-600">Score &lt;75</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Evaluated</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">45/52</div>
            <div className="text-sm text-gray-600">This quarter</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-600 text-sm font-medium">Action Items</span>
              <Zap className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">18</div>
            <div className="text-sm text-orange-600">5 overdue</div>
          </div>
        </div>
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Real-Time Supplier Performance Monitoring
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-refresh
              </label>
              <button
                onClick={() => setShowRealTimeMonitoring(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Score Changes</span>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">+3</div>
              <div className="text-xs text-green-600 mt-1">Improved today</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Tier Movements</span>
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-xs text-blue-600 mt-1">This week</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">At-Risk Suppliers</span>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <div className="text-xs text-red-600 mt-1">Below threshold</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Evaluations Due</span>
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">7</div>
              <div className="text-xs text-orange-600 mt-1">Next 7 days</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Performance Events</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">Tech Components Ltd upgraded to Gold tier</span>
                <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-gray-600">Chemical Supply Co score dropped to 78/100</span>
                <span className="text-gray-400 text-xs ml-auto">3 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">Plastic Solutions achieved 99.1 quality score</span>
                <span className="text-gray-400 text-xs ml-auto">5 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">Monthly evaluations completed for 12 suppliers</span>
                <span className="text-gray-400 text-xs ml-auto">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights */}
      {showAIInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI-Powered Supplier Insights
            </h3>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Performance Prediction</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">+4.2%</div>
              <p className="text-xs text-gray-600">Overall supplier performance expected to improve next quarter based on current trends</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-gray-900">Risk Alert</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">3</div>
              <p className="text-xs text-gray-600">Suppliers showing concerning performance decline patterns requiring immediate attention</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Optimization Opportunity</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">$250K</div>
              <p className="text-xs text-gray-600">Potential annual savings by optimizing supplier mix and consolidating top performers</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                <Medal className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Strategic Partnership Opportunity:</span>
                  <span className="text-gray-600"> Tech Innovations Inc consistently exceeds targets - consider expanding partnership and volume commitments</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-amber-50 rounded">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Supplier Development Needed:</span>
                  <span className="text-gray-600"> Standard Supplies declining to Bronze tier - schedule improvement workshop or consider alternative sources</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                <Badge className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Consolidation Opportunity:</span>
                  <span className="text-gray-600"> 3 suppliers in same category with similar scores - consolidate to top 2 performers for better rates and efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'rankings', 'metrics', 'benchmarks', 'trends', 'actions'].map((tab) => (
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
              {/* Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={performanceMetrics}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="metric" stroke="#6B7280" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
                      <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Radar name="Actual" dataKey="actual" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Score Trend Analysis</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scorecardHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="quarter" stroke="#6B7280" />
                      <YAxis domain={[80, 95]} stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Legend />
                      <Line type="monotone" dataKey="overall" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Overall" />
                      <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Quality" />
                      <Line type="monotone" dataKey="delivery" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Delivery" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Suppliers</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {supplierScores.slice(0, 3).map((supplier, index) => (
                      <div key={supplier.supplierId} className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                        <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center ${getTierColor(supplier.tier)}`}>
                          {getTierIcon(supplier.tier)}
                        </div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`text-3xl font-bold ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-500'
                          }`}>
                            #{supplier.rank}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{supplier.supplierName}</h4>
                            <div className="text-sm text-gray-600">{supplier.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-3xl font-bold text-gray-900">{supplier.overallScore}</div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {supplier.trend === 'up' ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : supplier.trend === 'down' ? (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            ) : (
                              <Activity className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-600">Quality</div>
                            <div className="font-medium">{supplier.qualityScore}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Delivery</div>
                            <div className="font-medium">{supplier.deliveryScore}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Service</div>
                            <div className="font-medium">{supplier.serviceScore}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                          <button
                            onClick={() => handleViewSupplierDetails(supplier)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium"
                            title="View Full Details"
                          >
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                          <button
                            onClick={() => handleViewTrends(supplier)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-xs font-medium"
                            title="View Performance Trends"
                          >
                            <TrendingUp className="w-3 h-3" />
                            Trends
                          </button>
                          <button
                            onClick={() => handleScheduleReview(supplier)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-xs font-medium"
                            title="Schedule Business Review"
                          >
                            <Calendar className="w-3 h-3" />
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI Performance */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {kpiDetails.map((kpi) => (
                    <div key={kpi.kpi} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm text-gray-600">{kpi.kpi}</div>
                        {kpi.status === 'good' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : kpi.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
                      <div className="text-xs text-gray-500 mt-1">Target: {kpi.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rankings' && (
            <div className="space-y-2">
              {/* Filters */}
              <div className="flex items-center gap-2 mb-2">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Categories</option>
                  <option>IT Services</option>
                  <option>Raw Materials</option>
                  <option>Logistics</option>
                  <option>Components</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Tiers</option>
                  <option>Platinum</option>
                  <option>Gold</option>
                  <option>Silver</option>
                  <option>Bronze</option>
                </select>
                <button
                  onClick={handleCompareSuppliers}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    comparisonMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={comparisonMode ? 'Compare Selected Suppliers' : 'Enable Comparison Mode'}
                >
                  <GitCompare className="w-4 h-4" />
                  {comparisonMode ? 'Compare Selected' : 'Compare'}
                </button>
              </div>

              {/* Rankings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      {comparisonMode && (
                        <th className="px-4 py-3 text-left">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Overall</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quality</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Delivery</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tier</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {supplierScores.map((supplier) => (
                      <tr key={supplier.supplierId} className="hover:bg-gray-50">
                        {comparisonMode && (
                          <td className="px-4 py-3">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${
                              supplier.rank === 1 ? 'text-yellow-500' :
                              supplier.rank === 2 ? 'text-gray-400' :
                              supplier.rank === 3 ? 'text-orange-500' :
                              'text-gray-600'
                            }`}>
                              {supplier.rank}
                            </span>
                            {supplier.rank <= 3 && (
                              <Medal className={`w-4 h-4 ${
                                supplier.rank === 1 ? 'text-yellow-500' :
                                supplier.rank === 2 ? 'text-gray-400' :
                                'text-orange-500'
                              }`} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{supplier.supplierName}</div>
                          <div className="text-sm text-gray-500">{supplier.supplierId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{supplier.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-gray-900">{supplier.overallScore}</div>
                            <div className="flex -space-x-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(supplier.overallScore / 20)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{supplier.qualityScore}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{supplier.deliveryScore}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{supplier.priceScore}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{supplier.serviceScore}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            supplier.tier === 'platinum' ? 'bg-gray-100 text-gray-700' :
                            supplier.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                            supplier.tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {getTierIcon(supplier.tier)}
                            {supplier.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {supplier.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : supplier.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <Activity className="w-4 h-4 text-gray-600" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewSupplierDetails(supplier)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-xs"
                              title="View Scorecard"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleViewTrends(supplier)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-xs"
                              title="Performance Trends"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExportSupplierReport(supplier)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs"
                              title="Export Report"
                            >
                              <Download className="w-3.5 h-3.5" />
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

          {activeTab === 'metrics' && (
            <div className="space-y-3">
              {/* Weighted Metrics */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics & Weights</h3>
                <div className="space-y-3">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.metric} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-900">{metric.metric}</div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {metric.weight}% weight
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {metric.trend === 'improving' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : metric.trend === 'declining' ? (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          ) : (
                            <Activity className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-sm text-gray-600">{metric.trend}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-xs text-gray-600">Target</div>
                          <div className="font-medium">{metric.target}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Actual</div>
                          <div className="font-medium">{metric.actual}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Score</div>
                          <div className={`font-medium ${
                            metric.score >= 100 ? 'text-green-600' :
                            metric.score >= 90 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {metric.score.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.score >= 100 ? 'bg-green-500' :
                            metric.score >= 90 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, metric.score)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Method */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scorecard Calculation Method</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Data Collection</h4>
                      <p className="text-sm text-gray-600 mt-1">Gather performance data from ERP, quality systems, and supplier feedback</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Normalization</h4>
                      <p className="text-sm text-gray-600 mt-1">Convert raw metrics to 0-100 scale based on targets and benchmarks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Weighted Calculation</h4>
                      <p className="text-sm text-gray-600 mt-1">Apply category weights and calculate weighted average score</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Tier Assignment</h4>
                      <p className="text-sm text-gray-600 mt-1">Assign supplier tiers based on overall score thresholds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="space-y-3">
              {/* Category Benchmarks */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Benchmarking</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryBenchmarks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} stroke="#6B7280" />
                    <YAxis domain={[70, 95]} stroke="#6B7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#6B7280" name="Category Average" />
                    <Bar dataKey="topScore" fill="#10B981" name="Top Performer" />
                    <Bar dataKey="yourScore" fill="#3B82F6" name="Your Suppliers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Industry Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Industry Percentile Ranking</h4>
                  <div className="space-y-3">
                    {[
                      { metric: 'Overall Score', percentile: 75, industry: 82 },
                      { metric: 'Quality', percentile: 82, industry: 85 },
                      { metric: 'Delivery', percentile: 68, industry: 88 },
                      { metric: 'Cost', percentile: 71, industry: 80 },
                      { metric: 'Innovation', percentile: 85, industry: 75 }
                    ].map((item) => (
                      <div key={item.metric}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{item.metric}</span>
                          <span className="text-sm font-medium">P{item.percentile}</span>
                        </div>
                        <div className="relative bg-gray-200 rounded-full h-2">
                          <div
                            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
                            style={{ width: `${item.percentile}%` }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-500"
                            style={{ left: `${item.industry}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      Your Position
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-0.5 h-3 bg-red-500"></div>
                      Industry Avg
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Best Practices Gap Analysis</h4>
                  <div className="space-y-3">
                    {[
                      { practice: 'Digital Integration', adoption: 65, bestInClass: 90 },
                      { practice: 'Sustainability', adoption: 70, bestInClass: 85 },
                      { practice: 'Risk Management', adoption: 75, bestInClass: 92 },
                      { practice: 'Innovation Partnership', adoption: 55, bestInClass: 80 },
                      { practice: 'Performance Tracking', adoption: 80, bestInClass: 95 }
                    ].map((item) => (
                      <div key={item.practice} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.practice}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{item.adoption}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(item.adoption / item.bestInClass) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{item.bestInClass}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-3">
              {/* Historical Performance */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Trend Analysis</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={scorecardHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="quarter" stroke="#6B7280" />
                    <YAxis yAxisId="left" domain={[80, 95]} stroke="#6B7280" />
                    <YAxis yAxisId="right" orientation="right" domain={[80, 95]} stroke="#6B7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="overall" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.3} name="Overall Score" />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} name="Quality" />
                    <Line yAxisId="right" type="monotone" dataKey="delivery" stroke="#F59E0B" strokeWidth={2} name="Delivery" />
                    <Line yAxisId="right" type="monotone" dataKey="service" stroke="#8B5CF6" strokeWidth={2} name="Service" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Predictive Analytics */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Predictions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">88.5</div>
                    <div className="text-sm text-gray-600 mt-1">Q2 2024 Forecast</div>
                    <div className="text-xs text-green-600 mt-2">+1.2 pts improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">3</div>
                    <div className="text-sm text-gray-600 mt-1">Suppliers to Platinum</div>
                    <div className="text-xs text-gray-500 mt-2">Next quarter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">5</div>
                    <div className="text-sm text-gray-600 mt-1">At Risk Suppliers</div>
                    <div className="text-xs text-amber-600 mt-2">Need intervention</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-gray-600 mt-1">Target Achievement</div>
                    <div className="text-xs text-purple-600 mt-2">End of year projection</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Improvement Actions & Initiatives</h3>

              {/* Action Items */}
              <div className="space-y-3">
                {improvementActions.map((action, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            action.priority === 'high' ? 'bg-red-100 text-red-700' :
                            action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {action.priority} priority
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            action.status === 'completed' ? 'bg-green-100 text-green-700' :
                            action.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {action.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{action.supplier}</h4>
                        <div className="text-sm text-gray-600 mt-1">Issue: {action.issue}</div>
                        <div className="text-sm text-gray-600">Action: {action.action}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-600 text-sm font-medium">High Priority</span>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Immediate action required</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-600 text-sm font-medium">In Progress</span>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Being addressed</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600 text-sm font-medium">Completed</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-600">This quarter</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}