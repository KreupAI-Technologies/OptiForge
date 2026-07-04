'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  LineChart,
  Lightbulb,
  Search,
  Sparkles,
  Settings,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Target,
  Activity,
  Zap,
} from 'lucide-react';
import { AIInsightsPanel, MLPrediction } from '@/components/industry4/AIInsightsPanel';
import { AnomalyDetection, Anomaly } from '@/components/industry4/AnomalyDetection';
import { PredictiveQualityCharts, QualityMetric } from '@/components/industry4/PredictiveQualityCharts';
import { SmartRecommendations, Recommendation } from '@/components/industry4/SmartRecommendations';
import { NaturalLanguageQuery } from '@/components/industry4/NaturalLanguageQuery';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'overview' | 'ai-insights' | 'anomalies' | 'quality' | 'recommendations' | 'ask-ai';

// ============================================================================
// Quick Stats Component
// ============================================================================

function QuickStats() {
  const stats = [
    { label: 'AI Predictions', value: '12', trend: 'Today', color: 'text-indigo-600', icon: Brain },
    { label: 'Active Anomalies', value: '3', trend: '2 critical', color: 'text-red-600', icon: AlertTriangle },
    { label: 'Quality Score', value: '96.2%', trend: '+1.4%', color: 'text-green-600', icon: Target },
    { label: 'Recommendations', value: '8', trend: '5 pending', color: 'text-amber-600', icon: Lightbulb },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// View Selector Component
// ============================================================================

function ViewSelector({
  currentView,
  onViewChange,
}: {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}) {
  const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'quality', label: 'Quality Forecast', icon: LineChart },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'ask-ai', label: 'Ask AI', icon: Search },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {views.map(view => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {view.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Smart Analytics Page
// ============================================================================

export default function SmartAnalyticsPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');

  // Live OEE records (primary data list) — fetched from the NestJS domain backend.
  const [oeeRecords, setOeeRecords] = useState<any[]>([]);
  const [oeeLoading, setOeeLoading] = useState<boolean>(true);
  const [oeeError, setOeeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setOeeLoading(true);
      setOeeError(null);
      try {
        const raw = await ProductionOrphanService.getOeeRecords();
        if (!cancelled) setOeeRecords(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) {
          setOeeError(err instanceof Error ? err.message : 'Failed to load OEE records');
          setOeeRecords([]);
        }
      } finally {
        if (!cancelled) setOeeLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Event handlers
  const handleInsightClick = (insight: MLPrediction) => {
    console.log('Insight clicked:', insight);
  };

  const handleInsightAction = (insightId: string, action: string) => {
    console.log('Insight action:', insightId, action);
  };

  const handleAnomalyClick = (anomaly: Anomaly) => {
    console.log('Anomaly clicked:', anomaly);
  };

  const handleAnomalyAcknowledge = (anomalyId: string) => {
    console.log('Anomaly acknowledged:', anomalyId);
  };

  const handleQualityMetricClick = (metric: QualityMetric) => {
    console.log('Quality metric clicked:', metric);
  };

  const handleRecommendationAction = (recommendationId: string, action: string) => {
    console.log('Recommendation action:', recommendationId, action);
  };

  const handleRecommendationFeedback = (recommendationId: string, helpful: boolean) => {
    console.log('Recommendation feedback:', recommendationId, helpful);
  };

  const handleQuerySubmit = (query: string) => {
    console.log('Query submitted:', query);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'ai-insights':
        return (
          <AIInsightsPanel
            onInsightClick={handleInsightClick}
            onActionClick={handleInsightAction}
            refreshInterval={30000}
          />
        );

      case 'anomalies':
        return (
          <AnomalyDetection
            onAnomalyClick={handleAnomalyClick}
            onAcknowledge={handleAnomalyAcknowledge}
            refreshInterval={5000}
          />
        );

      case 'quality':
        return (
          <PredictiveQualityCharts
            productLine="All Lines"
            timeRange="14d"
            onMetricClick={handleQualityMetricClick}
          />
        );

      case 'recommendations':
        return (
          <SmartRecommendations
            onRecommendationAction={handleRecommendationAction}
            onFeedback={handleRecommendationFeedback}
          />
        );

      case 'ask-ai':
        return (
          <NaturalLanguageQuery
            onQuerySubmit={handleQuerySubmit}
            placeholder="Ask anything about your production data..."
          />
        );

      default:
        // Overview - show all components in a compact layout
        return (
          <div className="space-y-3">
            {/* Live OEE Records — primary data list from the backend */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live OEE Records
                  </h2>
                  {!oeeLoading && !oeeError && (
                    <span className="text-xs text-gray-400">
                      {oeeRecords.length} record{oeeRecords.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {oeeLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading OEE records…
                  </div>
                )}

                {oeeError && !oeeLoading && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    {oeeError}
                  </div>
                )}

                {!oeeLoading && !oeeError && oeeRecords.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    No OEE records
                  </div>
                )}

                {!oeeLoading && !oeeError && oeeRecords.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <th className="px-3 py-2 font-medium">Work Center / Line</th>
                          <th className="px-3 py-2 font-medium">OEE</th>
                          <th className="px-3 py-2 font-medium">Availability</th>
                          <th className="px-3 py-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oeeRecords.map((r: any, i: number) => (
                          <tr
                            key={r?.id ?? i}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                              {r?.workCenterName ?? r?.productionLineName ?? r?.id ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {r?.oee ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {r?.availability ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {r?.recordDate ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Natural Language Query - Featured */}
            <NaturalLanguageQuery
              onQuerySubmit={handleQuerySubmit}
              placeholder="Ask AI: Show me defect trends, OEE analysis, maintenance needs..."
            />

            {/* AI Insights and Anomalies */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <AIInsightsPanel
                onInsightClick={handleInsightClick}
                onActionClick={handleInsightAction}
                refreshInterval={60000}
              />
              <AnomalyDetection
                onAnomalyClick={handleAnomalyClick}
                onAcknowledge={handleAnomalyAcknowledge}
                refreshInterval={10000}
              />
            </div>

            {/* Quality Charts */}
            <PredictiveQualityCharts
              productLine="All Lines"
              timeRange="14d"
              onMetricClick={handleQualityMetricClick}
            />

            {/* Recommendations */}
            <SmartRecommendations
              onRecommendationAction={handleRecommendationAction}
              onFeedback={handleRecommendationFeedback}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full py-2 space-y-3 max-w-full px-4">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            Smart Analytics & AI
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-13">
            Machine learning predictions, anomaly detection, and intelligent recommendations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
            <option value="all">All Production Lines</option>
            <option value="line-1">Production Line 1</option>
            <option value="line-2">Production Line 2</option>
            <option value="line-3">Production Line 3</option>
          </select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* View Selector */}
      <div className="flex items-center justify-between">
        <ViewSelector currentView={currentView} onViewChange={setCurrentView} />

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>AI models updating</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}
