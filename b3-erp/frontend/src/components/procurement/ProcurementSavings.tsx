'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Target, Zap, BarChart3, Award, Plus,
  Edit, Trash2, Download, RefreshCw, Settings, CheckCircle, XCircle,
  AlertCircle, FileText, Calendar, Star, TrendingDown, Activity,
  Percent, Package, Clock, Filter, Search, Eye, Send, ArrowUpRight
} from 'lucide-react';
import { procurementSavingsService } from '@/services/procurement-savings.service';
import { procurementPagesService } from '@/services/procurement-pages.service';
import { exportToCsv } from '@/lib/export';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export interface SavingsInitiative {
  id: string;
  name: string;
  category: string;
  type: 'price-reduction' | 'volume-consolidation' | 'process-improvement' | 'demand-management' | 'supplier-negotiation';
  targetSavings: number;
  actualSavings: number;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  owner: string;
  startDate: string;
  endDate: string;
  progress: number;
}

const ProcurementSavings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');
  const [showForecast, setShowForecast] = useState(true);
  const [showRealTimeTracking, setShowRealTimeTracking] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Savings initiatives — real fetch from the procurement savings service
  // (NestJS domain backend). Backend returns raw ORM shape; map onto the
  // SavingsInitiative model by best-fit. Derived totals via .reduce work fine
  // with an empty array until the table is seeded.
  const [savingsInitiatives, setSavingsInitiatives] = useState<SavingsInitiative[]>([]);

  const loadInitiatives = React.useCallback(async () => {
    try {
      const raw = (await procurementSavingsService.getInitiatives()) as any[];
      const target = (i: any) => Number(i.targetSavings ?? 0);
      const actual = (i: any) => Number(i.actualSavings ?? 0);
      const mapped: SavingsInitiative[] = raw.map((i) => {
        const t = target(i);
        const a = actual(i);
        return {
          id: i.id,
          name: i.title ?? '',
          category: i.category ?? '',
          type: (i.type ?? 'price-reduction') as SavingsInitiative['type'],
          targetSavings: t,
          actualSavings: a,
          status: (i.status ?? 'active') as SavingsInitiative['status'],
          owner: i.owner ?? '',
          startDate: i.startDate ?? '',
          endDate: i.endDate ?? '',
          progress: t > 0 ? Math.min(Math.round((a / t) * 100), 100) : 0,
        };
      });
      setSavingsInitiatives(mapped);
    } catch {
      setSavingsInitiatives([]);
    }
  }, []);

  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

  // Monthly savings — sourced from procurement savings insights API
  const [monthlySavings, setMonthlySavings] = useState<
    { month: string; target: number; actual: number; cumulative: number }[]
  >([]);

  // Savings by type — sourced from procurement savings insights API
  const [savingsByType, setSavingsByType] = useState<
    { type: string; savings: number; percentage: number; initiatives: number }[]
  >([]);

  // Savings by category — sourced from procurement savings insights API
  const [savingsByCategory, setSavingsByCategory] = useState<
    { category: string; savings: number; target: number; achievement: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await procurementPagesService.getSavingsInsights();
        setMonthlySavings(Array.isArray(data?.monthlySavings) ? data.monthlySavings : []);
        setSavingsByType(Array.isArray(data?.savingsByType) ? data.savingsByType : []);
        setSavingsByCategory(Array.isArray(data?.savingsByCategory) ? data.savingsByCategory : []);
      } catch {
        setMonthlySavings([]);
        setSavingsByType([]);
        setSavingsByCategory([]);
      }
    })();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSavingsTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'price-reduction': 'bg-green-100 text-green-800',
      'volume-consolidation': 'bg-blue-100 text-blue-800',
      'process-improvement': 'bg-purple-100 text-purple-800',
      'demand-management': 'bg-orange-100 text-orange-800',
      'supplier-negotiation': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const totalTargetSavings = savingsInitiatives.reduce((sum, i) => sum + i.targetSavings, 0);
  const totalActualSavings = savingsInitiatives.reduce((sum, i) => sum + i.actualSavings, 0);
  const totalInitiatives = savingsInitiatives.length;

  // Handler functions
  const handleCalculateSavings = () => {
    console.log('Calculating savings...');
    alert('Calculate Procurement Savings - This would open the savings calculation wizard with methodology selection, baseline establishment, and approval workflow.');
  };

  const handleTrackInitiatives = () => {
    console.log('Tracking savings initiatives...', savingsInitiatives);
    alert(`Track Savings Initiatives - Active: ${savingsInitiatives.filter(i => i.status === 'active').length}, Completed: ${savingsInitiatives.filter(i => i.status === 'completed').length}`);
  };

  const handleExportReports = () => {
    if (!savingsInitiatives.length) {
      alert('No savings initiatives to export.');
      return;
    }
    exportToCsv(
      `savings-initiatives-${new Date().toISOString().slice(0, 10)}.csv`,
      savingsInitiatives.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        type: i.type,
        targetSavings: i.targetSavings,
        actualSavings: i.actualSavings,
        achievementPct: i.targetSavings ? ((i.actualSavings / i.targetSavings) * 100).toFixed(1) : '0',
        progress: i.progress,
        owner: i.owner,
        startDate: i.startDate,
        endDate: i.endDate,
        status: i.status,
      })),
    );
  };

  const handleComparePeriods = () => {
    console.log('Comparing periods...');
    alert('Compare Savings Periods - This would show period-over-period comparison of savings, categories, types, and trends.');
  };

  const handleCreateInitiative = async () => {
    const title = window.prompt('Initiative title:');
    if (!title) return;
    const category = window.prompt('Category (optional):') ?? undefined;
    const targetSavings = Number(window.prompt('Target savings ($):', '0') ?? 0) || 0;
    try {
      await procurementSavingsService.createInitiative({
        title,
        category,
        targetSavings,
        actualSavings: 0,
        status: 'active',
      });
      await loadInitiatives();
    } catch (err) {
      console.error('Failed to create savings initiative:', err);
      alert('Failed to create savings initiative. Please try again.');
    }
  };

  const handleEditInitiative = async (initiative: SavingsInitiative) => {
    const name = window.prompt('Initiative title:', initiative.name)?.trim();
    if (!name) return;
    const actualStr = window.prompt('Actual savings ($):', String(initiative.actualSavings));
    if (actualStr === null) return;
    const actualSavings = Number(actualStr) || 0;
    try {
      await procurementSavingsService.updateInitiative(initiative.id, {
        title: name,
        actualSavings,
      });
      await loadInitiatives();
    } catch (err) {
      console.error('Failed to update savings initiative:', err);
      alert('Failed to update savings initiative. Please try again.');
    }
  };

  const handleDeleteInitiative = async (initiative: SavingsInitiative) => {
    if (!window.confirm(`Delete savings initiative "${initiative.name}"? This cannot be undone.`)) return;
    try {
      await procurementSavingsService.deleteInitiative(initiative.id);
      await loadInitiatives();
    } catch (err) {
      console.error('Failed to delete savings initiative:', err);
      alert('Failed to delete savings initiative. Please try again.');
    }
  };

  const handleAnalyzeTrends = () => {
    // No analytics endpoint exists (savings-initiatives is CRUD only); switch to
    // the analytics tab which renders the already-fetched savings insight charts.
    setActiveTab('analytics');
  };

  const handleManageBaselines = () => {
    console.log('Managing baselines...');
    alert('Manage Savings Baselines - This would open baseline creation, validation, and audit trail management.');
  };

  const handleRefresh = () => {
    void loadInitiatives();
  };

  const handleSettings = () => {
    console.log('Opening savings settings...');
    alert('Procurement Savings Settings - Configure program targets, savings types, calculation methods, and baseline requirements.');
  };
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Procurement Savings Tracker</h2>
            <p className="text-gray-600">Track and optimize procurement cost savings initiatives</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateInitiative}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Create Initiative"
            >
              <Plus className="h-4 w-4" />
              <span>New Initiative</span>
            </button>
            <button
              onClick={handleCalculateSavings}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              title="Calculate Savings"
            >
              <DollarSign className="h-4 w-4" />
              <span>Calculate</span>
            </button>
            <button
              onClick={handleExportReports}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              title="Export Reports"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <p className="text-2xl font-bold">${(totalActualSavings / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Actual Savings</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-gray-500">Annual</span>
          </div>
          <p className="text-2xl font-bold">${(totalTargetSavings / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Target Savings</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <span className="text-sm text-gray-500">Rate</span>
          </div>
          <p className="text-2xl font-bold">{((totalActualSavings / totalTargetSavings) * 100).toFixed(0)}%</p>
          <p className="text-sm text-gray-600">Achievement</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-bold">{savingsInitiatives.filter(i => i.status === 'active').length}</p>
          <p className="text-sm text-gray-600">Initiatives</p>
        </div>
      </div>

      {/* Real-Time Tracking Dashboard */}
      {showRealTimeTracking && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-3 mb-3 border border-green-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Real-Time Savings Tracking
                  {autoRefresh && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Live
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-600">Automated tracking and validation • Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition ${
                  autoRefresh ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Auto-Refresh
              </button>
              <button
                onClick={() => setShowRealTimeTracking(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Today's Progress</span>
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$12.4K</div>
              <div className="text-xs text-green-600 mt-1">↑ $3.2K vs yesterday</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '68%' }} />
                </div>
                <span className="text-xs text-gray-600">68%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">This Week</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$58.9K</div>
              <div className="text-xs text-blue-600 mt-1">Target: $65K (91%)</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '91%' }} />
                </div>
                <span className="text-xs text-gray-600">91%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">This Month</span>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$187K</div>
              <div className="text-xs text-purple-600 mt-1">Target: $200K (94%)</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '94%' }} />
                </div>
                <span className="text-xs text-gray-600">94%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Validation</span>
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$24.5K</div>
              <div className="text-xs text-amber-600 mt-1">8 initiatives awaiting</div>
              <button className="mt-2 text-xs text-amber-700 hover:text-amber-800 font-medium">
                Review Now →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Auto-Validated</h4>
                <p className="text-xs text-gray-600 mt-1">$42K in savings automatically validated via system integration</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">In Progress</h4>
                <p className="text-xs text-gray-600 mt-1">14 active initiatives tracking toward $285K annual target</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <Star className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Top Performer</h4>
                <p className="text-xs text-gray-600 mt-1">Supplier Consolidation initiative at 132% of target</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecasting Dashboard */}
      {showForecast && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-3 mb-3 border border-indigo-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI-Powered Savings Forecast</h2>
                <p className="text-sm text-gray-600">Predictive analytics and trend analysis • Confidence: 89%</p>
              </div>
            </div>
            <button
              onClick={() => setShowForecast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-600">Q2 Forecast</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">$425K</div>
              <div className="text-xs text-indigo-600 mt-1">↑ 15% vs Q1 actual</div>
              <div className="text-xs text-gray-500 mt-1">Based on 12 initiatives</div>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">EOY Projection</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">$1.72M</div>
              <div className="text-xs text-green-600 mt-1">On track for 108% of goal</div>
              <div className="text-xs text-gray-500 mt-1">High confidence (92%)</div>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Quick Wins</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">$156K</div>
              <div className="text-xs text-purple-600 mt-1">Available within 30 days</div>
              <div className="text-xs text-gray-500 mt-1">6 opportunities identified</div>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-gray-600">Risk-Adjusted</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">$1.54M</div>
              <div className="text-xs text-amber-600 mt-1">Conservative estimate</div>
              <div className="text-xs text-gray-500 mt-1">Accounts for 10% risk</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'initiatives', 'tracking', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Initiatives Table */}
      {activeTab === 'initiatives' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Savings Initiatives</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleTrackInitiatives}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors"
                title="Track Initiatives"
              >
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Track</span>
              </button>
              <button
                onClick={handleManageBaselines}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                title="Manage Baselines"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Baselines</span>
              </button>
              <button
                onClick={handleComparePeriods}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 text-sm transition-colors"
                title="Compare Periods"
              >
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Compare</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initiative</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achievement</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savingsInitiatives.map((initiative) => (
                  <tr key={initiative.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{initiative.name}</div>
                        <div className="text-xs text-gray-500">{initiative.id}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{initiative.category}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSavingsTypeColor(initiative.type)}`}>
                        {initiative.type.toUpperCase().replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(initiative.targetSavings / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(initiative.actualSavings / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        initiative.actualSavings >= initiative.targetSavings ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {((initiative.actualSavings / initiative.targetSavings) * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              initiative.progress >= 90
                                ? 'bg-green-500'
                                : initiative.progress >= 75
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${initiative.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{initiative.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{initiative.owner}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(initiative.status)}`}>
                        {initiative.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditInitiative(initiative)}
                          className="inline-flex items-center px-2 py-1 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-xs"
                          title="Edit initiative"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInitiative(initiative)}
                          className="inline-flex items-center px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs"
                          title="Delete initiative"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Charts */}
      {(activeTab === 'overview' || activeTab === 'analytics') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Monthly Savings Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlySavings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Cumulative" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Savings by Type</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={savingsByType.map(t => ({
                    name: t.type,
                    value: t.savings
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {savingsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Savings by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                <Bar dataKey="savings" fill="#10B981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Target Achievement by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsByCategory} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 120]} />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="achievement" fill="#3B82F6" name="Achievement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Initiative Progress Tracking</h4>
              <button
                onClick={handleAnalyzeTrends}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-purple-300 bg-purple-50 rounded-lg hover:bg-purple-100 text-sm transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700">Analyze Trends</span>
              </button>
            </div>
            <div className="space-y-2">
              {savingsInitiatives.filter(i => i.status === 'active').map((initiative) => (
                <div key={initiative.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{initiative.name}</span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSavingsTypeColor(initiative.type)}`}>
                          {initiative.type.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Owner: {initiative.owner} • {initiative.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(initiative.actualSavings / 1000).toFixed(0)}K / ${(initiative.targetSavings / 1000).toFixed(0)}K
                      </div>
                      <div className={`text-sm ${
                        initiative.actualSavings >= initiative.targetSavings ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {((initiative.actualSavings / initiative.targetSavings) * 100).toFixed(0)}% achieved
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full ${
                        initiative.progress >= 90
                          ? 'bg-green-500'
                          : initiative.progress >= 75
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${initiative.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress: {initiative.progress}%</span>
                    <span>End: {initiative.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Completed Initiatives</h4>
              <div className="space-y-3">
                {savingsInitiatives.filter(i => i.status === 'completed').map((init) => (
                  <div key={init.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-sm">{init.name}</p>
                        <p className="text-xs text-gray-600">{init.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">${(init.actualSavings / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500">{((init.actualSavings / init.targetSavings) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Performance Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Target Met/Exceeded</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {savingsInitiatives.filter(i => i.actualSavings >= i.targetSavings).length} / {totalInitiatives}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium">On Track (&gt;75%)</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    {savingsInitiatives.filter(i => i.progress >= 75 && i.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium">Needs Attention (&lt;75%)</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {savingsInitiatives.filter(i => i.progress < 75 && i.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Top Performers</h4>
              <div className="space-y-3">
                {savingsInitiatives
                  .sort((a, b) => (b.actualSavings / b.targetSavings) - (a.actualSavings / a.targetSavings))
                  .slice(0, 3)
                  .map((init, idx) => (
                    <div key={init.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{init.name.substring(0, 25)}...</p>
                          <p className="text-xs text-gray-500">{init.category}</p>
                        </div>
                      </div>
                      <span className="text-sm text-green-600 font-medium">
                        {((init.actualSavings / init.targetSavings) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Savings by Type</h4>
              <div className="space-y-2">
                {savingsByType.slice(0, 3).map((type) => (
                  <div key={type.type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{type.type}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">${(type.savings / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500">{type.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={handleCalculateSavings}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Calculate Savings</span>
                </button>
                <button
                  onClick={handleTrackInitiatives}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  <span>Track Progress</span>
                </button>
                <button
                  onClick={handleAnalyzeTrends}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Analyze Trends</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Initiative completed above target</p>
                  <p className="text-xs text-gray-500 mt-1">{savingsInitiatives.filter(i => i.status === 'completed' && i.actualSavings > i.targetSavings)[0]?.name} - {((savingsInitiatives.filter(i => i.status === 'completed' && i.actualSavings > i.targetSavings)[0]?.actualSavings / savingsInitiatives.filter(i => i.status === 'completed' && i.actualSavings > i.targetSavings)[0]?.targetSavings - 1) * 100).toFixed(0)}% over target</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Monthly target exceeded</p>
                  <p className="text-xs text-gray-500 mt-1">{monthlySavings[monthlySavings.length - 2]?.month ?? '—'}: ${(monthlySavings[monthlySavings.length - 2]?.actual ?? 0).toLocaleString()} (Target: ${(monthlySavings[monthlySavings.length - 2]?.target ?? 0).toLocaleString()})</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <Plus className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New initiative created</p>
                  <p className="text-xs text-gray-500 mt-1">{savingsInitiatives.filter(i => i.status === 'active')[savingsInitiatives.filter(i => i.status === 'active').length - 1]?.name} - Target: ${(savingsInitiatives.filter(i => i.status === 'active')[savingsInitiatives.filter(i => i.status === 'active').length - 1]?.targetSavings / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementSavings;
