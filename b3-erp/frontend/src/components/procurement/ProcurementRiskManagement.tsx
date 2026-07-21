'use client';

import React, { useState, useEffect } from 'react';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Users,
  Package,
  Zap,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckSquare,
  XSquare,
  Globe,
  Building2
} from 'lucide-react';
import {
  LineChart,
  Line,
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
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area
} from 'recharts';

interface Risk {
  id: string;
  title: string;
  category: 'supply-chain' | 'financial' | 'compliance' | 'operational' | 'strategic' | 'geopolitical';
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: number; // 1-100
  impact: number; // 1-100
  riskScore: number; // likelihood × impact
  status: 'identified' | 'assessed' | 'mitigating' | 'monitoring' | 'closed';
  owner: string;
  supplier?: string;
  identifiedDate: string;
  lastReviewDate: string;
  mitigationPlan?: string;
  residualRisk: number;
}

export default function ProcurementRiskManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Risks - populated from getRiskInsights() (falls back to [] on error)
  const [risks, setRisks] = useState<Risk[]>([]);
  // Derived from getRiskInsights().assessments (category counts + likelihood/impact matrix)
  const [categoryDistribution, setCategoryDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [riskMatrix, setRiskMatrix] = useState<Array<{ x: number; y: number; z: number; name: string; severity: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await procurementPagesService.getRiskInsights();
        const assessments: any[] = data?.assessments ?? [];

        setRiskTrends(Array.isArray(data?.riskTrends) ? data.riskTrends : []);
        setMitigationProgress(Array.isArray(data?.mitigationProgress) ? data.mitigationProgress : []);

        if (!assessments.length) return;

        const validCategories: Risk['category'][] = [
          'supply-chain', 'financial', 'compliance', 'operational', 'strategic', 'geopolitical'
        ];
        const mapCategory = (c: any): Risk['category'] => {
          const norm = String(c ?? '').toLowerCase().replace(/[\s_]+/g, '-');
          return (validCategories.includes(norm as Risk['category'])
            ? norm
            : 'operational') as Risk['category'];
        };
        const mapSeverity = (level: any): Risk['severity'] => {
          const norm = String(level ?? '').toLowerCase();
          return (['critical', 'high', 'medium', 'low'].includes(norm)
            ? norm
            : 'medium') as Risk['severity'];
        };

        const mapped: Risk[] = assessments.map((a) => {
          const financial = Number(a?.factors?.financial ?? 0);
          const operational = Number(a?.factors?.operational ?? 0);
          const compliance = Number(a?.factors?.compliance ?? 0);
          const geographic = Number(a?.factors?.geographic ?? 0);
          const score = Number(a?.riskScore ?? 0);
          return {
            id: String(a?.vendorId ?? ''),
            title: String(a?.vendorName ?? 'Vendor Risk'),
            category: mapCategory(a?.category),
            severity: mapSeverity(a?.riskLevel),
            likelihood: Math.round((financial + operational + compliance + geographic) / 4) || score,
            impact: Math.round((financial + operational + compliance + geographic) / 4) || score,
            riskScore: score,
            status: 'assessed',
            owner: String(a?.vendorName ?? 'Unassigned'),
            supplier: String(a?.vendorName ?? ''),
            identifiedDate: new Date().toISOString().slice(0, 10),
            lastReviewDate: new Date().toISOString().slice(0, 10),
            mitigationPlan: undefined,
            residualRisk: Number(a?.spendExposure ?? 0),
          };
        });

        setRisks(mapped);

        // Category distribution derived from assessment categories
        const catColors: Record<string, string> = {
          'supply-chain': '#3B82F6',
          financial: '#EF4444',
          compliance: '#F59E0B',
          operational: '#10B981',
          strategic: '#8B5CF6',
          geopolitical: '#EC4899',
        };
        const palette = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
        const counts = new Map<string, number>();
        for (const m of mapped) counts.set(m.category, (counts.get(m.category) || 0) + 1);
        setCategoryDistribution(
          Array.from(counts.entries()).map(([name, value], i) => ({
            name: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            value,
            color: catColors[name] || palette[i % palette.length],
          }))
        );

        // Risk matrix (likelihood × impact bubble = spend exposure) from assessments
        setRiskMatrix(
          mapped.map((m) => ({
            x: m.likelihood,
            y: m.impact,
            z: m.residualRisk,
            name: m.title,
            severity: m.severity,
          }))
        );
      } catch {
        // keep empty [] on failure
      }
    })();
  }, []);

  // Risk trends (loaded from backend getRiskInsights().riskTrends)
  const [riskTrends, setRiskTrends] = useState<Array<{
    month: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>>([]);

  // Mitigation progress (loaded from backend getRiskInsights().mitigationProgress)
  const [mitigationProgress, setMitigationProgress] = useState<Array<{
    name: string;
    completion: number;
    onTrack: boolean;
  }>>([]);

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

  // Handler 1: Identify Risks - Risk identification wizard
  const handleIdentifyRisks = () => {
    // Risk identification workflow — backend not yet available.
  };

  // Handler 2: Assess Impact - Detailed impact assessment
  const handleAssessImpact = () => {
    // Risk impact assessment workflow — backend not yet available.
  };

  // Handler 3: Create Mitigation Plan
  const handleCreateMitigationPlan = () => {
    // Mitigation plan development workflow — backend not yet available.
  };

  // Handler 4: Monitor Risks
  const handleMonitorRisks = () => {
    // Real-time risk monitoring dashboard — backend not yet available.
  };

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              Procurement Risk Management
            </h1>
            <p className="text-gray-600 mt-2">Identify, assess, and mitigate supply chain risks proactively</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleIdentifyRisks}
              disabled
              title="Risk identification workflow — backend not yet available"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Identify Risks
            </button>
            <button
              onClick={handleAssessImpact}
              disabled
              title="Risk impact assessment workflow — backend not yet available"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart3 className="w-4 h-4" />
              Assess Impact
            </button>
            <button
              onClick={handleCreateMitigationPlan}
              disabled
              title="Mitigation plan development workflow — backend not yet available"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Mitigation Plan
            </button>
            <button
              onClick={handleMonitorRisks}
              disabled
              title="Real-time risk monitoring dashboard — backend not yet available"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Activity className="w-4 h-4" />
              Monitor
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-600 text-sm font-medium">Critical Risks</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1</div>
            <div className="text-sm text-gray-600">Immediate action</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-600 text-sm font-medium">High Risks</span>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-sm text-gray-600">Active monitoring</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Total Risks</span>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">21</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">-3 this month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Risk Exposure</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">$18.5M</div>
            <div className="text-sm text-gray-600">Total financial impact</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Mitigation Rate</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">87%</div>
            <div className="text-sm text-gray-600">Successfully mitigated</div>
          </div>
        </div>
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Real-Time Risk Monitoring
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
                <span className="text-sm font-medium text-gray-600">New Risks (24h)</span>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-xs text-red-600 mt-1">1 critical</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Escalated Risks</span>
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-amber-600 mt-1">This week</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Mitigated</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-xs text-green-600 mt-1">Past 7 days</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Reviews Due</span>
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">6</div>
              <div className="text-xs text-orange-600 mt-1">Next 14 days</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Live Risk Activity Feed</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-gray-600">Critical risk identified: Single source for semiconductor chips</span>
                <span className="text-gray-400 text-xs ml-auto">15 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">Risk RISK008 successfully mitigated and closed</span>
                <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-gray-600">Supplier financial risk elevated from medium to high</span>
                <span className="text-gray-400 text-xs ml-auto">3 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">New mitigation plan approved for RISK003</span>
                <span className="text-gray-400 text-xs ml-auto">5 hours ago</span>
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
              AI-Powered Risk Intelligence
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
                <span className="text-sm font-semibold text-gray-900">Emerging Risk</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">High</div>
              <p className="text-xs text-gray-600">Geopolitical tensions may impact 3 critical suppliers in Asia-Pacific region within 30 days</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-900">Risk Trend</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1">+12%</div>
              <p className="text-xs text-gray-600">Supply chain risk exposure increasing due to commodity price volatility and logistics constraints</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Cost Avoidance</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">$2.4M</div>
              <p className="text-xs text-gray-600">Potential losses avoided through proactive risk mitigation activities this quarter</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Risk Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 bg-red-50 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Urgent Action Required:</span>
                  <span className="text-gray-600"> Qualify backup supplier for critical components within 30 days to reduce single-source dependency risk</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-amber-50 rounded">
                <Shield className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Financial Health Monitor:</span>
                  <span className="text-gray-600"> 2 suppliers showing concerning credit indicators - recommend requesting updated financial statements</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                <TrendingDown className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Optimization Opportunity:</span>
                  <span className="text-gray-600"> Consolidate 4 low-risk suppliers to reduce management overhead while maintaining supply security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'risks', 'matrix', 'mitigation', 'analytics'].map((tab) => (
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
              {/* Risk Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Trends by Severity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={riskTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Legend />
                      <Area type="monotone" dataKey="low" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Low" />
                      <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Medium" />
                      <Area type="monotone" dataKey="high" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="High" />
                      <Area type="monotone" dataKey="critical" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.8} name="Critical" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Distribution by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Matrix Scatter */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Impact Matrix</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" dataKey="x" name="Likelihood" unit="%" domain={[0, 100]} stroke="#6B7280" />
                    <YAxis type="number" dataKey="y" name="Impact" domain={[0, 100]} stroke="#6B7280" />
                    <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Risks" data={riskMatrix} fill="#3B82F6">
                      {riskMatrix.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.severity === 'critical' ? '#DC2626' :
                            entry.severity === 'high' ? '#EF4444' :
                            entry.severity === 'medium' ? '#F59E0B' : '#10B981'
                          }
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Mitigation Progress */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Mitigation Plan Progress</h3>
                </div>
                <div className="p-4">
                  {mitigationProgress.map((item, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.completion}%</span>
                          {item.onTrack ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.onTrack ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${item.completion}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

{activeTab === 'risks' && (
            <div className="space-y-2">
              {/* Risk Cards */}
              <div className="grid grid-cols-1 gap-2">
                {risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`border-l-4 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition ${
                      risk.severity === 'critical' ? 'border-red-600' :
                      risk.severity === 'high' ? 'border-orange-500' :
                      risk.severity === 'medium' ? 'border-yellow-500' :
                      'border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{risk.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            risk.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            risk.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {risk.severity.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            risk.status === 'mitigating' ? 'bg-blue-100 text-blue-700' :
                            risk.status === 'monitoring' ? 'bg-purple-100 text-purple-700' :
                            risk.status === 'assessed' ? 'bg-gray-100 text-gray-700' :
                            risk.status === 'closed' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {risk.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {risk.category}
                          </span>
                          {risk.supplier && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {risk.supplier}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {risk.owner}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{risk.riskScore}</div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Likelihood</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${risk.likelihood}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{risk.likelihood}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Impact</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${risk.impact}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{risk.impact}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Residual Risk</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(risk.residualRisk / risk.riskScore) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{risk.residualRisk}</span>
                        </div>
                      </div>
                    </div>

                    {risk.mitigationPlan && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">Mitigation Plan:</div>
                        <div className="text-sm text-gray-600">{risk.mitigationPlan}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Identified: {risk.identifiedDate}</span>
                        <span>Last Review: {risk.lastReviewDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1">
                          <Edit className="w-4 h-4" />
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
