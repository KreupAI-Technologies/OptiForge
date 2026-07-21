'use client'

import React, { useState, useEffect } from 'react'
import { procurementPagesService } from '@/services/procurement-pages.service'
import {
  Cpu,
  Bot,
  Zap,
  Brain,
  Activity,
  Settings,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Clock,
  RefreshCw,
  Target,
  Sparkles,
  GitBranch,
  Layers,
  Code,
  Database,
  Cloud,
  Shield,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Workflow,
  Timer,
  Calculator,
  FileSearch,
  MessageSquare,
  Bell,
  PieChart,
  LineChart,
  Gauge
} from 'lucide-react'
import {
  ConfigureRulesModal,
  TestAutomationModal,
  ViewLogsModal,
  ManageAutomationModal
} from '@/components/procurement/AutomationModals'
import {
  LineChart as ReLineChart,
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
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
  Sankey,
  Treemap
} from 'recharts'

interface AutomationRule {
  id: string
  name: string
  type: 'workflow' | 'approval' | 'matching' | 'prediction' | 'optimization'
  status: 'active' | 'paused' | 'testing' | 'disabled'
  triggersPerDay: number
  successRate: number
  timeSaved: number
  lastRun: string
  nextRun?: string
  aiEnabled: boolean
}

interface AIInsight {
  id: string
  category: string
  insight: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  recommendation: string
  potentialSavings?: number
  status: 'new' | 'reviewing' | 'implemented' | 'dismissed'
}

interface ProcessMetric {
  process: string
  manual: number
  automated: number
  aiOptimized: number
  efficiency: number
}

export default function ProcurementAutomation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [showAIConfig, setShowAIConfig] = useState(false)

  // Modal states
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationRule | null>(null)
  const [isNewRule, setIsNewRule] = useState(false)

  // Modal handlers
  const handleConfigureRule = (rule?: AutomationRule) => {
    setSelectedAutomation(rule || null)
    setIsNewRule(!rule)
    setIsConfigureModalOpen(true)
  }

  const handleTestAutomation = (rule: AutomationRule) => {
    setSelectedAutomation(rule)
    setIsTestModalOpen(true)
  }

  const handleViewLogs = (rule: AutomationRule) => {
    setSelectedAutomation(rule)
    setIsLogsModalOpen(true)
  }

  const handleManageAutomation = (rule: AutomationRule) => {
    setSelectedAutomation(rule)
    setIsManageModalOpen(true)
  }

  // Mock data
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [processMetrics, setProcessMetrics] = useState<ProcessMetric[]>([])
  const [automationTrend, setAutomationTrend] = useState<{ month: string; manual: number; automated: number; ai: number }[]>([])
  const [workflowStages, setWorkflowStages] = useState<{ stage: string; automated: number; time: string; previousTime: string }[]>([])

  useEffect(() => {
    const loadAutomationRules = async () => {
      try {
        const insights = await procurementPagesService.getAutomationInsights()

        setAutomationTrend(Array.isArray(insights?.automationTrend) ? insights.automationTrend : [])
        setProcessMetrics(Array.isArray(insights?.processMetrics) ? insights.processMetrics : [])
        setWorkflowStages(Array.isArray(insights?.workflowStages) ? insights.workflowStages : [])
        setAiInsights(Array.isArray(insights?.aiInsights) ? insights.aiInsights : [])

        const rules: any[] = Array.isArray(insights?.rules) ? insights.rules : []
        if (rules.length === 0) return
        const mapped: AutomationRule[] = rules.map((r: any) => ({
          id: String(r?.id ?? ''),
          name: String(r?.name ?? 'Untitled Rule'),
          type: 'workflow',
          status: r?.active ? 'active' : 'paused',
          triggersPerDay: Number(r?.runs ?? 0),
          successRate: 100,
          timeSaved: Number(r?.savedHours ?? 0),
          lastRun: '—',
          nextRun: 'Continuous',
          aiEnabled: false
        }))
        setAutomationRules(mapped)
      } catch (err) {
        console.error('Failed to load automation rules', err)
      }
    }
    loadAutomationRules()
  }, [])

  const aiPredictions = [
    { metric: 'Demand Forecast', accuracy: 87, improvement: 12 },
    { metric: 'Price Prediction', accuracy: 82, improvement: 8 },
    { metric: 'Supplier Risk', accuracy: 91, improvement: 15 },
    { metric: 'Lead Time', accuracy: 85, improvement: 10 },
    { metric: 'Quality Issues', accuracy: 89, improvement: 18 }
  ]

  const costSavings = [
    { area: 'Process Automation', savings: 450000, hours: 2400 },
    { area: 'AI Optimization', savings: 320000, hours: 1200 },
    { area: 'Error Reduction', savings: 180000, hours: 800 },
    { area: 'Cycle Time', savings: 150000, hours: 600 }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const calculateTotalTimeSaved = () => {
    return automationRules.reduce((sum, rule) => sum + rule.timeSaved, 0)
  }

  const calculateTotalSavings = () => {
    return costSavings.reduce((sum, item) => sum + item.savings, 0)
  }

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-blue-600" />
              Procurement Automation & AI
            </h1>
            <p className="text-gray-600 mt-2">Intelligent automation and AI-powered procurement optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleViewLogs(automationRules[0])}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FileSearch className="w-4 h-4" />
              View Logs
            </button>
            <button
              onClick={() => handleConfigureRule()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Automation
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Automation Rate</span>
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">72%</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+15% YoY</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">AI Adoption</span>
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">45%</div>
            <div className="text-sm text-gray-600">Of processes</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Time Saved</span>
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{(calculateTotalTimeSaved() / 60).toFixed(0)}h</div>
            <div className="text-sm text-gray-600">Per day</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">Cost Savings</span>
              <Calculator className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${(calculateTotalSavings() / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Annual</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-600 text-sm font-medium">Active Rules</span>
              <Zap className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">28</div>
            <div className="text-sm text-green-600">3 new this week</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-600 text-sm font-medium">AI Accuracy</span>
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">87%</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+5% improvement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'automation', 'ai-insights', 'workflows', 'performance', 'configuration'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Automation Trend */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Automation Evolution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={automationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Legend />
                    <Area type="monotone" dataKey="manual" stackId="1" stroke="#EF4444" fill="#FEE2E2" name="Manual" />
                    <Area type="monotone" dataKey="automated" stackId="1" stroke="#3B82F6" fill="#DBEAFE" name="Automated" />
                    <Area type="monotone" dataKey="ai" stackId="1" stroke="#8B5CF6" fill="#EDE9FE" name="AI-Powered" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Process Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Automation Levels</h3>
                  <div className="space-y-3">
                    {processMetrics.map((metric) => (
                      <div key={metric.process}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{metric.process}</span>
                          <span className="text-sm text-gray-600">{metric.efficiency}% efficient</span>
                        </div>
                        <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-red-400 flex items-center justify-center text-xs text-white"
                            style={{ width: `${metric.manual}%` }}
                          >
                            {metric.manual > 10 && `${metric.manual}%`}
                          </div>
                          <div
                            className="bg-blue-500 flex items-center justify-center text-xs text-white"
                            style={{ width: `${metric.automated}%` }}
                          >
                            {metric.automated > 10 && `${metric.automated}%`}
                          </div>
                          <div
                            className="bg-purple-500 flex items-center justify-center text-xs text-white"
                            style={{ width: `${metric.aiOptimized}%` }}
                          >
                            {metric.aiOptimized > 10 && `${metric.aiOptimized}%`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-400 rounded"></div>Manual
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>Automated
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>AI-Optimized
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Prediction Accuracy</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" data={aiPredictions}>
                      <RadialBar background dataKey="accuracy">
                        {aiPredictions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RadialBar>
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost Savings Impact */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Automation Impact & Savings</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {costSavings.map((item) => (
                      <div key={item.area} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${(item.savings / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{item.area}</div>
                        <div className="text-xs text-gray-500 mt-2">{item.hours.toLocaleString()} hours saved</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-3">
              {/* Automation Rules */}
              <div className="space-y-2">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            rule.status === 'active' ? 'bg-green-100 text-green-600' :
                            rule.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                            rule.status === 'testing' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {rule.type === 'workflow' && <Workflow className="w-5 h-5" />}
                            {rule.type === 'approval' && <CheckCircle className="w-5 h-5" />}
                            {rule.type === 'matching' && <GitBranch className="w-5 h-5" />}
                            {rule.type === 'prediction' && <Brain className="w-5 h-5" />}
                            {rule.type === 'optimization' && <Zap className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="capitalize">{rule.type}</span>
                              {rule.aiEnabled && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  <Sparkles className="w-3 h-3" />
                                  AI-Powered
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div>
                            <div className="text-xs text-gray-500">Triggers/Day</div>
                            <div className="font-medium">{rule.triggersPerDay}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Success Rate</div>
                            <div className="font-medium text-green-600">{rule.successRate}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Time Saved</div>
                            <div className="font-medium">{rule.timeSaved} min/day</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Last Run</div>
                            <div className="font-medium">{rule.lastRun}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          rule.status === 'active' ? 'bg-green-100 text-green-700' :
                          rule.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                          rule.status === 'testing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.status === 'active' && <Play className="w-3 h-3 mr-1" />}
                          {rule.status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
                          {rule.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfigureRule(rule)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                            title="Configure Rule"
                          >
                            <Settings className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleTestAutomation(rule)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                            title="Test Automation"
                          >
                            <Play className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleViewLogs(rule)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                            title="View Logs"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleManageAutomation(rule)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                            title="Manage Status"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Rule */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Bot className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Automation Rule</h3>
                <p className="text-sm text-gray-600 mb-2">Set up intelligent automation for your procurement processes</p>
                <button
                  onClick={() => handleConfigureRule()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Configure Automation
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="space-y-3">
              {/* AI Insights Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-600 text-sm font-medium">Active Insights</span>
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-600">8 high priority</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600 text-sm font-medium">Implemented</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">42</div>
                  <div className="text-sm text-gray-600">This quarter</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-600 text-sm font-medium">Avg Confidence</span>
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">89%</div>
                  <div className="text-sm text-green-600">+3% improvement</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-600 text-sm font-medium">Total Savings</span>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">$850K</div>
                  <div className="text-sm text-gray-600">From AI insights</div>
                </div>
              </div>

              {/* AI Insights List */}
              <div className="space-y-3">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-600' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">{insight.category}</span>
                            <h4 className="font-semibold text-gray-900">{insight.insight}</h4>
                          </div>
                        </div>

                        <div className="ml-11">
                          <p className="text-sm text-gray-600 mb-3">{insight.recommendation}</p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Confidence:</span>
                              <span className="font-medium">{insight.confidence}%</span>
                            </div>
                            {insight.potentialSavings && (
                              <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Potential:</span>
                                <span className="font-medium text-green-600">
                                  ${(insight.potentialSavings / 1000).toFixed(0)}K
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          insight.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          insight.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                          insight.status === 'implemented' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {insight.status}
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">
                          Take Action
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Model Performance */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Model Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Prediction Accuracy</span>
                      <Brain className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">87.3%</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87.3%' }} />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">False Positive Rate</span>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">4.2%</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '4.2%' }} />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Model Confidence</span>
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">91.8%</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '91.8%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-3">
              {/* Workflow Automation Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Workflow Performance</h3>
                <div className="space-y-2">
                  {workflowStages.map((stage) => (
                    <div key={stage.stage} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                        <span className="text-sm text-gray-600">{stage.automated}% automated</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 mb-3">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                          style={{ width: `${stage.automated}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current: {stage.time}</span>
                        <span className="text-gray-400 line-through">Previous: {stage.previousTime}</span>
                        <span className="text-green-600 font-medium">
                          {Math.round((1 - parseInt(stage.time) / parseInt(stage.previousTime)) * 100)}% faster
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Builder */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Workflow Builder</h3>
                <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Workflow className="w-16 h-16 text-gray-400 mb-2" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Drag & Drop Workflow Designer</h4>
                    <p className="text-sm text-gray-600 mb-2">Create custom automated workflows with our visual builder</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Open Workflow Builder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-3">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Automation ROI Analysis</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { metric: 'Time Saved', value: 2400, unit: 'hours' },
                      { metric: 'Cost Reduced', value: 450, unit: '$K' },
                      { metric: 'Errors Reduced', value: 78, unit: '%' },
                      { metric: 'Speed Increase', value: 65, unit: '%' },
                      { metric: 'Efficiency Gain', value: 42, unit: '%' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="metric" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Bar dataKey="value" fill="#3B82F6">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">System Performance</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Processing Speed</span>
                        <span className="font-medium">250 tx/sec</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">System Uptime</span>
                        <span className="font-medium">99.98%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.98%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">API Response Time</span>
                        <span className="font-medium">120ms avg</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Data Quality Score</span>
                        <span className="font-medium">96.5%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96.5%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Analysis */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Impact Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Timer className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">65%</div>
                    <div className="text-sm text-gray-600">Cycle Time Reduction</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">42%</div>
                    <div className="text-sm text-gray-600">Productivity Increase</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-8 h-8 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">78%</div>
                    <div className="text-sm text-gray-600">Error Reduction</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calculator className="w-8 h-8 text-amber-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">3.2x</div>
                    <div className="text-sm text-gray-600">ROI Achievement</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI & Automation Configuration</h3>

              {/* Configuration Sections */}
              <div className="space-y-2">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Model Settings</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prediction Confidence Threshold</label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        defaultValue="85"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>50%</span>
                        <span>Current: 85%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Learning Mode</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Continuous Learning</option>
                        <option>Scheduled Training</option>
                        <option>Manual Updates</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-sm text-gray-700">Enable real-time anomaly detection</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Automation Rules</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Auto-approve orders under threshold</span>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Automatic supplier matching</span>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Predictive demand ordering</span>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Smart contract renewals</span>
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    </label>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Integration Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ERP Integration</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                          Connected: SAP S/4HANA
                        </div>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Settings</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">AI Platform</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm">
                          Azure AI Services
                        </div>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Settings</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    Reset to Defaults
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automation Modals */}
      <ConfigureRulesModal
        isOpen={isConfigureModalOpen}
        onClose={() => setIsConfigureModalOpen(false)}
        automation={selectedAutomation ? {
          id: selectedAutomation.id,
          name: selectedAutomation.name,
          type: selectedAutomation.type,
          status: selectedAutomation.status,
          triggersPerDay: selectedAutomation.triggersPerDay,
          successRate: selectedAutomation.successRate,
          timeSaved: selectedAutomation.timeSaved,
          lastRun: selectedAutomation.lastRun,
          nextRun: selectedAutomation.nextRun,
          aiEnabled: selectedAutomation.aiEnabled
        } : undefined}
        onSubmit={(data) => {
          console.log('Configure rule:', data);
          setIsConfigureModalOpen(false);
        }}
        isNew={isNewRule}
      />

      <TestAutomationModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        automation={selectedAutomation ? {
          id: selectedAutomation.id,
          name: selectedAutomation.name,
          type: selectedAutomation.type,
          status: selectedAutomation.status,
          triggersPerDay: selectedAutomation.triggersPerDay,
          successRate: selectedAutomation.successRate,
          timeSaved: selectedAutomation.timeSaved,
          lastRun: selectedAutomation.lastRun,
          nextRun: selectedAutomation.nextRun,
          aiEnabled: selectedAutomation.aiEnabled
        } : undefined}
        onSubmit={(data) => {
          console.log('Test automation:', data);
          setIsTestModalOpen(false);
        }}
      />

      <ViewLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        automation={selectedAutomation ? {
          id: selectedAutomation.id,
          name: selectedAutomation.name,
          type: selectedAutomation.type,
          status: selectedAutomation.status,
          triggersPerDay: selectedAutomation.triggersPerDay,
          successRate: selectedAutomation.successRate,
          timeSaved: selectedAutomation.timeSaved,
          lastRun: selectedAutomation.lastRun,
          nextRun: selectedAutomation.nextRun,
          aiEnabled: selectedAutomation.aiEnabled
        } : undefined}
        onExport={(data) => {
          console.log('Export logs:', data);
          setIsLogsModalOpen(false);
        }}
      />

      <ManageAutomationModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        automation={selectedAutomation ? {
          id: selectedAutomation.id,
          name: selectedAutomation.name,
          type: selectedAutomation.type,
          status: selectedAutomation.status,
          triggersPerDay: selectedAutomation.triggersPerDay,
          successRate: selectedAutomation.successRate,
          timeSaved: selectedAutomation.timeSaved,
          lastRun: selectedAutomation.lastRun,
          nextRun: selectedAutomation.nextRun,
          aiEnabled: selectedAutomation.aiEnabled
        } : undefined}
        onSubmit={(data) => {
          console.log('Manage automation:', data);
          setIsManageModalOpen(false);
        }}
      />
    </div>
  )
}