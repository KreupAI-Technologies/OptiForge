'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Search, Filter, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, Area, AreaChart } from 'recharts';
import { exportToCsv } from '@/lib/export';

type ProjectMetric = {
  id: string;
  projectCode: string;
  projectName: string;
  spi: number; // Schedule Performance Index
  cpi: number; // Cost Performance Index
  qualityScore: number;
  defectRate: number;
  onTimeDelivery: number; // percentage
  customerSat: number; // 1-10
  teamVelocity: number;
  riskScore: number; // 0-100
  status: 'on-track' | 'at-risk' | 'critical';
};

const PROJECT_METRICS: ProjectMetric[] = [
  {
    id: '1',
    projectCode: 'KF-A',
    projectName: 'Kitchen Fitout - Tower A',
    spi: 0.92,
    cpi: 1.05,
    qualityScore: 94,
    defectRate: 1.2,
    onTimeDelivery: 88,
    customerSat: 8.5,
    teamVelocity: 23,
    riskScore: 35,
    status: 'on-track'
  },
  {
    id: '2',
    projectCode: 'LVW-09',
    projectName: 'Luxury Villa Wardrobes',
    spi: 0.85,
    cpi: 0.88,
    qualityScore: 91,
    defectRate: 2.1,
    onTimeDelivery: 75,
    customerSat: 7.8,
    teamVelocity: 19,
    riskScore: 58,
    status: 'at-risk'
  },
  {
    id: '3',
    projectCode: 'CPR-12',
    projectName: 'Corporate Pantry Rollout',
    spi: 1.08,
    cpi: 1.12,
    qualityScore: 96,
    defectRate: 0.8,
    onTimeDelivery: 95,
    customerSat: 9.2,
    teamVelocity: 26,
    riskScore: 18,
    status: 'on-track'
  },
  {
    id: '4',
    projectCode: 'SR-08',
    projectName: 'Showroom Refurbishment',
    spi: 0.78,
    cpi: 0.82,
    qualityScore: 87,
    defectRate: 3.5,
    onTimeDelivery: 68,
    customerSat: 7.2,
    teamVelocity: 15,
    riskScore: 72,
    status: 'critical'
  }
];

const velocityTrendData = [
  { week: 'W34', velocity: 18, target: 20 },
  { week: 'W35', velocity: 22, target: 20 },
  { week: 'W36', velocity: 20, target: 20 },
  { week: 'W37', velocity: 24, target: 20 },
  { week: 'W38', velocity: 25, target: 20 },
  { week: 'W39', velocity: 23, target: 20 },
  { week: 'W40', velocity: 26, target: 20 },
  { week: 'W41', velocity: 24, target: 20 }
];

const qualityTrendData = [
  { month: 'Jun', score: 88, defects: 15 },
  { month: 'Jul', score: 91, defects: 12 },
  { month: 'Aug', score: 93, defects: 8 },
  { month: 'Sep', score: 92, defects: 10 },
  { month: 'Oct', score: 94, defects: 7 }
];

const performanceByPhase = [
  { phase: 'Planning', projects: 12, avgSPI: 1.05, avgCPI: 1.08 },
  { phase: 'Execution', projects: 18, avgSPI: 0.92, avgCPI: 0.95 },
  { phase: 'Monitoring', projects: 8, avgSPI: 0.98, avgCPI: 1.02 },
  { phase: 'Closing', projects: 5, avgSPI: 1.12, avgCPI: 1.15 }
];

const kpiSummary = [
  { kpi: 'On-time Delivery', target: '95%', current: '82%', variance: -13, trend: 'down', unit: '%' },
  { kpi: 'Budget Adherence', target: '±5%', current: '+3%', variance: 3, trend: 'up', unit: '%' },
  { kpi: 'Quality Score', target: '> 90', current: '92', variance: 2, trend: 'up', unit: '' },
  { kpi: 'Defect Rate', target: '< 2%', current: '1.9%', variance: -0.1, trend: 'up', unit: '%' },
  { kpi: 'Customer Satisfaction', target: '> 8.0', current: '8.2', variance: 0.2, trend: 'up', unit: '/10' },
  { kpi: 'Team Velocity', target: '> 20', current: '23', variance: 3, trend: 'up', unit: 'pts' },
  { kpi: 'Resource Utilization', target: '75-85%', current: '78%', variance: 0, trend: 'stable', unit: '%' },
  { kpi: 'Risk Score', target: '< 40', current: '46', variance: 6, trend: 'down', unit: '' }
];

export default function PerformanceMetricsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const projects = useMemo(() => ['all', ...Array.from(new Set(PROJECT_METRICS.map(p => p.projectCode)))], []);

  const filtered = useMemo(() => {
    return PROJECT_METRICS.filter(p => {
      const matchesSearch = [p.projectCode, p.projectName].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProject = projectFilter === 'all' ? true : p.projectCode === projectFilter;
      const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [searchTerm, projectFilter, statusFilter]);

  // Calculate aggregate metrics
  const avgSPI = (PROJECT_METRICS.reduce((sum, p) => sum + p.spi, 0) / PROJECT_METRICS.length).toFixed(2);
  const avgCPI = (PROJECT_METRICS.reduce((sum, p) => sum + p.cpi, 0) / PROJECT_METRICS.length).toFixed(2);
  const avgQuality = Math.round(PROJECT_METRICS.reduce((sum, p) => sum + p.qualityScore, 0) / PROJECT_METRICS.length);
  const avgVelocity = Math.round(PROJECT_METRICS.reduce((sum, p) => sum + p.teamVelocity, 0) / PROJECT_METRICS.length);
  const criticalCount = PROJECT_METRICS.filter(p => p.status === 'critical').length;
  const atRiskCount = PROJECT_METRICS.filter(p => p.status === 'at-risk').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-50 text-green-700';
      case 'at-risk': return 'bg-yellow-50 text-yellow-700';
      case 'critical': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getPerformanceColor = (value: number, threshold: number, inverse: boolean = false) => {
    if (inverse) {
      return value <= threshold ? 'text-green-600' : 'text-red-600';
    }
    return value >= threshold ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-teal-600" />
          Performance Metrics
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive KPIs, project performance indicators, and trend analysis</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects, metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button onClick={() => exportToCsv('performance-metrics', filtered)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Schedule Performance</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{avgSPI}</p>
              <p className="text-xs text-teal-600 mt-1">Avg SPI</p>
            </div>
            <BarChart3 className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Cost Performance</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{avgCPI}</p>
              <p className="text-xs text-green-600 mt-1">Avg CPI</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Quality Score</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{avgQuality}%</p>
              <p className="text-xs text-blue-600 mt-1">Portfolio Avg</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Team Velocity</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{avgVelocity}</p>
              <p className="text-xs text-purple-600 mt-1">Avg Points/Week</p>
            </div>
            <Activity className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">At Risk</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{atRiskCount}</p>
              <p className="text-xs text-yellow-600 mt-1">Projects</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{criticalCount}</p>
              <p className="text-xs text-red-600 mt-1">Projects</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {projects.map(p => (
              <option key={p} value={p}>{p === 'all' ? 'All Projects' : p}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="critical">Critical</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setProjectFilter('all');
              setStatusFilter('all');
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Team Velocity Trend</h3>
            <span className="text-xs text-gray-500">Last 8 weeks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="velocity" stroke="#0d9488" fillOpacity={1} fill="url(#colorVelocity)" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Quality Trend</h3>
            <span className="text-xs text-gray-500">Last 5 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Quality Score" />
                <Line yAxisId="right" type="monotone" dataKey="defects" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Defects" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance by Phase */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Performance by Project Phase</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceByPhase} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgSPI" fill="#0d9488" radius={[4,4,0,0]} name="Avg SPI" />
              <Bar dataKey="avgCPI" fill="#6366f1" radius={[4,4,0,0]} name="Avg CPI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Metrics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-2">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-800">Project Performance Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">SPI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">CPI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Quality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Defect Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">On-Time %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Cust Sat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Velocity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{p.projectName}</span>
                      <span className="text-xs text-gray-500">{p.projectCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(p.spi, 0.9)}`}>
                      {p.spi.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(p.cpi, 0.9)}`}>
                      {p.cpi.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(p.qualityScore, 90)}`}>
                      {p.qualityScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(p.defectRate, 2, true)}`}>
                      {p.defectRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(p.onTimeDelivery, 80)}`}>
                      {p.onTimeDelivery}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(p.customerSat, 8)}`}>
                      {p.customerSat}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {p.teamVelocity}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div
                          className={`h-2 rounded ${p.riskScore > 60 ? 'bg-red-500' : p.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${p.riskScore}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{p.riskScore}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">No projects found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-800">KPI Summary & Targets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">KPI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Current</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Variance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {kpiSummary.map((kpi, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.kpi}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{kpi.target}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{kpi.current}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={kpi.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {kpi.variance > 0 ? '+' : ''}{kpi.variance}{kpi.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend)}
                      <span className="text-xs capitalize text-gray-600">{kpi.trend}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Performance Metrics Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Key Performance Indicators:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="font-medium">SPI ≥ 1.0:</span> On schedule or ahead</li>
              <li><span className="font-medium">CPI ≥ 1.0:</span> Within or under budget</li>
              <li><span className="font-medium">Quality &gt; 90%:</span> Excellent quality</li>
              <li><span className="font-medium">Defect Rate &lt; 2%:</span> Target defect rate</li>
              <li><span className="font-medium">Customer Sat &gt; 8.0:</span> High satisfaction</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Monitoring Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Review metrics weekly with project teams</li>
              <li>Track trends over time for early warnings</li>
              <li>Escalate critical projects immediately</li>
              <li>Address at-risk projects with corrective action</li>
              <li>Celebrate on-track projects and successes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
