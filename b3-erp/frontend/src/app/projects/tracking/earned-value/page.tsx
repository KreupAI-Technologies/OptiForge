'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Search, Filter, Download, DollarSign, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

interface EvmProject {
  id: string;
  projectCode: string;
  projectName: string;
  budgetAtCompletion: number; // BAC
  plannedValue: number; // PV
  earnedValue: number; // EV
  actualCost: number; // AC
  progressPercent: number;
  startDate: string;
  endDate: string;
  status: 'on-track' | 'behind-schedule' | 'over-budget' | 'at-risk';
}

const mockEvmData: EvmProject[] = [
  {
    id: '1',
    projectCode: 'PRJ-2025-001',
    projectName: 'Kitchen Fitout - Tower A',
    budgetAtCompletion: 625000,
    plannedValue: 425000,
    earnedValue: 425000,
    actualCost: 425000,
    progressPercent: 68,
    startDate: '2025-10-01',
    endDate: '2025-11-09',
    status: 'on-track'
  },
  {
    id: '2',
    projectCode: 'PRJ-2025-002',
    projectName: 'Luxury Villa Wardrobes',
    budgetAtCompletion: 780000,
    plannedValue: 406000,
    earnedValue: 390000,
    actualCost: 406000,
    progressPercent: 50,
    startDate: '2025-10-05',
    endDate: '2025-11-10',
    status: 'behind-schedule'
  },
  {
    id: '3',
    projectCode: 'PRJ-2025-003',
    projectName: 'Corporate Pantry Rollout',
    budgetAtCompletion: 450000,
    plannedValue: 315000,
    earnedValue: 337500,
    actualCost: 315000,
    progressPercent: 75,
    startDate: '2025-10-10',
    endDate: '2025-10-29',
    status: 'on-track'
  },
  {
    id: '4',
    projectCode: 'PRJ-2025-004',
    projectName: 'Showroom Refurbishment',
    budgetAtCompletion: 920000,
    plannedValue: 552000,
    earnedValue: 506000,
    actualCost: 575000,
    progressPercent: 55,
    startDate: '2025-10-15',
    endDate: '2025-11-11',
    status: 'over-budget'
  },
  {
    id: '5',
    projectCode: 'PRJ-2025-005',
    projectName: 'Hotel Renovation Phase 2',
    budgetAtCompletion: 1250000,
    plannedValue: 625000,
    earnedValue: 562500,
    actualCost: 650000,
    progressPercent: 45,
    startDate: '2025-10-08',
    endDate: '2025-11-30',
    status: 'at-risk'
  }
];

const EVM_STATUSES: EvmProject['status'][] = ['on-track', 'behind-schedule', 'over-budget', 'at-risk'];

export default function EarnedValueManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [rows, setRows] = useState<EvmProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listEarnedValue();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const mapped: EvmProject[] = list.map((r: Record<string, unknown>) => ({
          id: String(r.id ?? ''),
          projectCode: String(r.projectCode ?? ''),
          projectName: String(r.projectName ?? ''),
          budgetAtCompletion: Number(r.budgetAtCompletion ?? 0),
          plannedValue: Number(r.plannedValue ?? 0),
          earnedValue: Number(r.earnedValue ?? 0),
          actualCost: Number(r.actualCost ?? 0),
          progressPercent: Number(r.progressPercent ?? 0),
          startDate: String(r.startDate ?? ''),
          endDate: String(r.endDate ?? ''),
          status: EVM_STATUSES.includes(r.status as EvmProject['status'])
            ? (r.status as EvmProject['status'])
            : 'on-track',
        }));
        setRows(mapped);
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load earned value data');
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return rows.filter(project => {
      const matchesSearch = searchTerm === '' ||
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, rows]);

  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    const totalBAC = rows.reduce((sum, p) => sum + p.budgetAtCompletion, 0);
    const totalPV = rows.reduce((sum, p) => sum + p.plannedValue, 0);
    const totalEV = rows.reduce((sum, p) => sum + p.earnedValue, 0);
    const totalAC = rows.reduce((sum, p) => sum + p.actualCost, 0);

    const portfolioSV = totalEV - totalPV;
    const portfolioCV = totalEV - totalAC;
    const portfolioSPI = totalPV > 0 ? totalEV / totalPV : 0;
    const portfolioCPI = totalAC > 0 ? totalEV / totalAC : 0;
    const portfolioEAC = portfolioCPI > 0 ? totalBAC / portfolioCPI : 0;
    const portfolioVAC = totalBAC - portfolioEAC;

    return {
      totalBAC,
      totalPV,
      totalEV,
      totalAC,
      portfolioSV,
      portfolioCV,
      portfolioSPI,
      portfolioCPI,
      portfolioEAC,
      portfolioVAC
    };
  }, [rows]);

  // Calculate EVM metrics for a project
  const calculateEvmMetrics = (project: EvmProject) => {
    const { budgetAtCompletion, plannedValue, earnedValue, actualCost } = project;

    // Variances
    const scheduleVariance = earnedValue - plannedValue; // SV
    const costVariance = earnedValue - actualCost; // CV

    // Performance Indices
    const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 0; // SPI
    const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 0; // CPI

    // Forecasting
    const estimateAtCompletion = costPerformanceIndex > 0 ? budgetAtCompletion / costPerformanceIndex : 0; // EAC
    const estimateToComplete = estimateAtCompletion - actualCost; // ETC
    const varianceAtCompletion = budgetAtCompletion - estimateAtCompletion; // VAC
    const toCompletePerformanceIndex = (budgetAtCompletion - earnedValue) / (budgetAtCompletion - actualCost); // TCPI

    return {
      scheduleVariance,
      costVariance,
      schedulePerformanceIndex,
      costPerformanceIndex,
      estimateAtCompletion,
      estimateToComplete,
      varianceAtCompletion,
      toCompletePerformanceIndex
    };
  };

  const getStatusColor = (status: EvmProject['status']) => {
    switch (status) {
      case 'on-track': return 'bg-green-50 text-green-700 border-green-200';
      case 'behind-schedule': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'over-budget': return 'bg-red-50 text-red-700 border-red-200';
      case 'at-risk': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPerformanceColor = (value: number, threshold: number = 1.0) => {
    if (value >= threshold) return 'text-green-700 font-semibold';
    if (value >= threshold * 0.9) return 'text-yellow-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  const getVarianceColor = (value: number) => {
    if (value >= 0) return 'text-green-700 font-semibold';
    return 'text-red-700 font-semibold';
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-teal-600" />
          Earned Value Management
        </h1>
        <p className="text-gray-600 mt-2">EVM analysis, forecasting, and performance measurement</p>
      </div>

      {isLoading && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Loading earned value data...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCsv('earned-value', filteredProjects as unknown as Record<string, unknown>[])} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Planned Value (PV)</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">₹{(portfolioStats.totalPV / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Earned Value (EV)</p>
              <p className="text-3xl font-bold text-green-900 mt-1">₹{(portfolioStats.totalEV / 100000).toFixed(1)}L</p>
            </div>
            <Activity className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Actual Cost (AC)</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">₹{(portfolioStats.totalAC / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Cost Variance (CV)</p>
              <p className={`text-3xl font-bold mt-1 ${portfolioStats.portfolioCV >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₹{(portfolioStats.portfolioCV / 100000).toFixed(1)}L
              </p>
            </div>
            {portfolioStats.portfolioCV >= 0 ? (
              <TrendingUp className="h-12 w-12 text-green-600 opacity-50" />
            ) : (
              <TrendingDown className="h-12 w-12 text-red-600 opacity-50" />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">CPI</p>
              <p className={`text-3xl font-bold mt-1 ${portfolioStats.portfolioCPI >= 1 ? 'text-green-700' : 'text-red-700'}`}>
                {portfolioStats.portfolioCPI.toFixed(2)}
              </p>
            </div>
            <Activity className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">SPI</p>
              <p className={`text-3xl font-bold mt-1 ${portfolioStats.portfolioSPI >= 1 ? 'text-green-700' : 'text-red-700'}`}>
                {portfolioStats.portfolioSPI.toFixed(2)}
              </p>
            </div>
            <Activity className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="on-track">On Track</option>
            <option value="behind-schedule">Behind Schedule</option>
            <option value="over-budget">Over Budget</option>
            <option value="at-risk">At Risk</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredProjects.length} of {rows.length} projects
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="space-y-2">
        {filteredProjects.map((project) => {
          const metrics = calculateEvmMetrics(project);

          return (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.projectName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{project.projectCode} • Progress: {project.progressPercent}%</p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Budget at Completion (BAC)</p>
                  <p className="text-sm font-medium text-gray-900">₹{project.budgetAtCompletion.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Planned Value (PV)</p>
                  <p className="text-sm font-medium text-gray-900">₹{project.plannedValue.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Earned Value (EV)</p>
                  <p className="text-sm font-medium text-gray-900">₹{project.earnedValue.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Actual Cost (AC)</p>
                  <p className="text-sm font-medium text-gray-900">₹{project.actualCost.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Variances */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">Schedule Variance (SV)</p>
                  <p className={`text-lg font-semibold ${getVarianceColor(metrics.scheduleVariance)}`}>
                    ₹{metrics.scheduleVariance.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">EV - PV</p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium mb-1">Cost Variance (CV)</p>
                  <p className={`text-lg font-semibold ${getVarianceColor(metrics.costVariance)}`}>
                    ₹{metrics.costVariance.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">EV - AC</p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-700 font-medium mb-1">Schedule Performance Index (SPI)</p>
                  <p className={`text-lg font-semibold ${getPerformanceColor(metrics.schedulePerformanceIndex)}`}>
                    {metrics.schedulePerformanceIndex.toFixed(3)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">EV / PV</p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium mb-1">Cost Performance Index (CPI)</p>
                  <p className={`text-lg font-semibold ${getPerformanceColor(metrics.costPerformanceIndex)}`}>
                    {metrics.costPerformanceIndex.toFixed(3)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">EV / AC</p>
                </div>
              </div>

              {/* Forecasting */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">Estimate at Completion (EAC)</p>
                  <p className="text-sm font-semibold text-gray-900">₹{metrics.estimateAtCompletion.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">BAC / CPI</p>
                </div>

                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">Estimate to Complete (ETC)</p>
                  <p className="text-sm font-semibold text-gray-900">₹{metrics.estimateToComplete.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">EAC - AC</p>
                </div>

                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">Variance at Completion (VAC)</p>
                  <p className={`text-sm font-semibold ${getVarianceColor(metrics.varianceAtCompletion)}`}>
                    ₹{metrics.varianceAtCompletion.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">BAC - EAC</p>
                </div>

                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">To-Complete Performance Index (TCPI)</p>
                  <p className={`text-sm font-semibold ${getPerformanceColor(metrics.toCompletePerformanceIndex)}`}>
                    {metrics.toCompletePerformanceIndex.toFixed(3)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">(BAC-EV) / (BAC-AC)</p>
                </div>
              </div>

              {/* Performance Alerts */}
              {(metrics.costPerformanceIndex < 0.9 || metrics.schedulePerformanceIndex < 0.9) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Performance Alert</p>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      {metrics.costPerformanceIndex < 0.9 && (
                        <li>• Project is over budget (CPI = {metrics.costPerformanceIndex.toFixed(3)} &lt; 1.0)</li>
                      )}
                      {metrics.schedulePerformanceIndex < 0.9 && (
                        <li>• Project is behind schedule (SPI = {metrics.schedulePerformanceIndex.toFixed(3)} &lt; 1.0)</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="h-16 w-16 mb-2 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Found</h3>
            <p className="text-gray-600">No projects match your current filters</p>
          </div>
        )}
      </div>

      {/* Guidelines Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">EVM Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Key Metrics</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">PV (Planned Value):</span> Budgeted cost for work scheduled</li>
              <li><span className="font-medium">EV (Earned Value):</span> Budgeted cost for work completed</li>
              <li><span className="font-medium">AC (Actual Cost):</span> Actual cost incurred for work completed</li>
              <li><span className="font-medium">BAC (Budget at Completion):</span> Total planned budget</li>
              <li><span className="font-medium">EAC (Estimate at Completion):</span> Expected total cost</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Variances</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">SV (Schedule Variance):</span> EV - PV (positive = ahead)</li>
              <li><span className="font-medium">CV (Cost Variance):</span> EV - AC (positive = under budget)</li>
              <li><span className="font-medium">VAC (Variance at Completion):</span> BAC - EAC</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Performance Indices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">SPI (Schedule Performance Index):</span> EV / PV (&gt;1.0 = ahead)</li>
              <li><span className="font-medium">CPI (Cost Performance Index):</span> EV / AC (&gt;1.0 = under budget)</li>
              <li><span className="font-medium">TCPI (To-Complete Performance Index):</span> Required future CPI</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Update EVM metrics weekly or bi-weekly</li>
              <li>• Establish clear performance measurement baseline</li>
              <li>• Use consistent earned value measurement techniques</li>
              <li>• Track CPI and SPI trends over time</li>
              <li>• Investigate significant variances immediately</li>
              <li>• Use EVM for early warning of cost/schedule issues</li>
              <li>• Integrate EVM with risk management</li>
              <li>• Report EVM metrics to stakeholders regularly</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Interpretation Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>
              <p className="font-medium mb-1">CPI &gt; 1.0:</p>
              <p>Project is under budget (good performance)</p>
            </div>
            <div>
              <p className="font-medium mb-1">CPI &lt; 1.0:</p>
              <p>Project is over budget (poor performance)</p>
            </div>
            <div>
              <p className="font-medium mb-1">SPI &gt; 1.0:</p>
              <p>Project is ahead of schedule (good performance)</p>
            </div>
            <div>
              <p className="font-medium mb-1">SPI &lt; 1.0:</p>
              <p>Project is behind schedule (poor performance)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
