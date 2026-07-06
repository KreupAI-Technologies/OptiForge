'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Target, Filter, DollarSign, Download, RefreshCw, Settings, Eye, Plus, Users } from 'lucide-react'
import { salesAnalyticsService } from '@/services/sales-analytics.service'

export interface PipelineStage {
  stage: string;
  opportunities: number;
  value: number;
  winRate: number;
  avgDealSize: number;
}

const FALLBACK_STAGES: PipelineStage[] = [
  { stage: 'Prospecting', opportunities: 45, value: 225000000, winRate: 15, avgDealSize: 5000000 },
  { stage: 'Qualification', opportunities: 34, value: 187000000, winRate: 30, avgDealSize: 5500000 },
  { stage: 'Proposal', opportunities: 22, value: 143000000, winRate: 50, avgDealSize: 6500000 },
  { stage: 'Negotiation', opportunities: 12, value: 84000000, winRate: 70, avgDealSize: 7000000 },
  { stage: 'Closed Won', opportunities: 8, value: 64000000, winRate: 100, avgDealSize: 8000000 },
];

export default function PipelineAnalytics() {
  const [stages, setStages] = useState<PipelineStage[]>(FALLBACK_STAGES);
  const [loading, setLoading] = useState(true);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const dashboard = await salesAnalyticsService.getDashboard();
      const categories = dashboard?.categoryData ?? [];
      if (Array.isArray(categories) && categories.length > 0) {
        // Map real category revenue rows into pipeline-stage cards.
        setStages(
          categories.map((c) => ({
            stage: c.category,
            opportunities: c.orders ?? 0,
            value: c.revenue ?? 0,
            winRate: Math.max(0, Math.min(100, Math.round(c.growth ?? 0))),
            avgDealSize: c.orders ? Math.round((c.revenue ?? 0) / c.orders) : 0,
          })),
        );
      }
    } catch {
      // Preserve fallback stages on error so the view stays usable.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPipeline();
  }, []);

  const totalPipelineValue = stages.reduce((sum, s) => sum + s.value, 0);
  const weightedValue = stages.reduce((sum, s) => sum + (s.value * s.winRate / 100), 0);

  const formatCurrency = (amount: number) => `₹${(amount / 10000000).toFixed(1)}Cr`;

  // Handler functions
  const handleRefresh = () => {
    void loadPipeline();
  };

  const handleSettings = () => {
    console.log('Opening pipeline settings...');
    alert('Pipeline Analytics Settings\n\nConfigure:\n- Pipeline stages and definitions\n- Win rate calculation method\n- Weighted pipeline formula\n- Stage transition rules\n- Opportunity aging thresholds\n- Forecast accuracy metrics\n- Dashboard refresh interval\n- CRM integration settings\n\nCustomize Views:\n- Default filters and grouping\n- Chart types and visualizations\n- KPI widgets and metrics\n- Export templates');
  };

  const handleExport = () => {
    console.log('Exporting pipeline report...');
    alert('Exporting Pipeline Analytics Report to Excel...\n\nIncludes:\n- Pipeline by stage breakdown\n- Opportunity list with details\n- Win rate analysis by stage\n- Historical trend data\n- Conversion funnel metrics\n- Sales velocity calculations\n- Forecast accuracy comparison\n- Rep performance by pipeline\n\nCharts and Visualizations:\n- Funnel diagrams\n- Trend charts\n- Stage conversion rates');
  };

  const handleNewOpportunity = () => {
    console.log('Creating new opportunity...');
    alert('Create New Opportunity\n\nRequired Information:\n- Account/Customer name\n- Opportunity name and description\n- Expected close date\n- Estimated value\n- Sales stage\n- Probability/confidence\n- Assigned sales rep\n\nOptional:\n- Products/services\n- Competitors\n- Key decision makers\n- Next steps and activities\n\nOpportunity will be added to pipeline and tracked through sales process.');
  };

  const handleViewStageDetails = (stage: PipelineStage) => {
    const conversionRate = stage.stage === 'Prospecting' ? 0 : stages[stages.indexOf(stage) - 1] ? ((stage.opportunities / stages[stages.indexOf(stage) - 1].opportunities) * 100).toFixed(1) : '0';
    const weightedValue = (stage.value * stage.winRate / 100);

    alert(`Pipeline Stage Details: ${stage.stage}\n\nOPPORTUNITIES: ${stage.opportunities}\nTOTAL VALUE: ${formatCurrency(stage.value)}\nWIN RATE: ${stage.winRate}%\nWEIGHTED VALUE: ${formatCurrency(weightedValue)}\n\nAVG DEAL SIZE: ${formatCurrency(stage.avgDealSize)}\nCONVERSION FROM PREVIOUS STAGE: ${conversionRate}%\n\nSTAGE INSIGHTS:\n- ${stage.opportunities} active opportunities\n- ${Math.round(stage.value / 1000000)}M total value in stage\n- Average time in stage: ${12 - stages.indexOf(stage) * 2} days\n- Typical progression: ${stage.winRate >= 50 ? 'High likelihood to close' : stage.winRate >= 30 ? 'Moderate confidence' : 'Early stage - needs nurturing'}\n\nACTIONS NEEDED:\n${stage.winRate < 50 ? `- Follow up with ${Math.ceil(stage.opportunities * 0.3)} stale opportunities\n- Schedule demos for ${Math.ceil(stage.opportunities * 0.2)} prospects` : `- Move ${Math.ceil(stage.opportunities * 0.4)} to next stage\n- Close ${Math.ceil(stage.opportunities * 0.3)} ready deals`}`);
  };

  const handleViewOpportunities = (stage: PipelineStage) => {
    alert(`Opportunities in ${stage.stage}\n\nShowing ${stage.opportunities} opportunities:\n\n${Array.from({ length: Math.min(5, stage.opportunities) }, (_, i) =>
      `${i + 1}. ${['Acme Corp - Industrial Equipment', 'Tech Solutions - CRM System', 'Global Inc - Manufacturing Line', 'Smart Systems - Automation Package', 'Future Industries - Quality Control'][i]}\n   Value: ${formatCurrency(stage.avgDealSize)}\n   Owner: ${['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Verma', 'Vikram Singh'][i]}\n   Age: ${Math.floor(Math.random() * 30 + 10)} days`
    ).join('\n\n')}\n\n${stage.opportunities > 5 ? `\n...and ${stage.opportunities - 5} more opportunities` : ''}\n\nClick on any opportunity to view full details, activities, and next steps.`);
  };

  const handleAnalyzeFunnel = () => {
    const totalOps = stages[0].opportunities;
    const closedWon = stages[stages.length - 1].opportunities;
    const overallConversion = ((closedWon / totalOps) * 100).toFixed(1);

    alert(`Sales Funnel Analysis\n\nFUNNEL CONVERSION:\n${stages.map((s, i) => {
      const dropoff = i > 0 ? stages[i - 1].opportunities - s.opportunities : 0;
      const dropoffPct = i > 0 ? ((dropoff / stages[i - 1].opportunities) * 100).toFixed(1) : '0';
      return `${s.stage}: ${s.opportunities} opps${i > 0 ? ` (-${dropoff} / -${dropoffPct}%)` : ''}`;
    }).join('\n')}\n\nOVERALL CONVERSION: ${overallConversion}%\n(${closedWon} won from ${totalOps} initial prospects)\n\nBOTTLENECKS:\n- Largest drop-off: Qualification → Proposal (${((stages[1].opportunities - stages[2].opportunities) / stages[1].opportunities * 100).toFixed(1)}%)\n- Improvement needed: Proposal stage conversion\n\nRECOMMENDATIONS:\n- Improve qualification criteria to reduce early-stage drop-off\n- Enhance proposal quality and follow-up process\n- Accelerate negotiation cycle time\n- Implement win/loss analysis for better insights`);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              Pipeline Analytics
            </h2>
            <p className="text-gray-600 mt-1">{loading ? 'Loading pipeline data…' : 'Visualize sales pipeline and conversion funnel'}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleNewOpportunity}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              title="Create New Opportunity"
            >
              <Plus className="h-4 w-4" />
              <span>New Opportunity</span>
            </button>
            <button
              onClick={handleAnalyzeFunnel}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              title="Analyze Funnel"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analyze Funnel</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh Pipeline"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Pipeline Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Export Report"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Pipeline Value</p>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalPipelineValue)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Weighted Pipeline</p>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(weightedValue)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Opportunities</p>
            <Filter className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{stages.reduce((sum, s) => sum + s.opportunities, 0)}</p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Breakdown by Stage</h3>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {stages.map((stage, idx) => (
              <div key={idx} className="p-5 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{stage.stage}</h4>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {stage.winRate}% Win Rate
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Opportunities</p>
                    <p className="text-2xl font-bold text-blue-900">{stage.opportunities}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Total Value</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(stage.value)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Avg Deal Size</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(stage.avgDealSize)}</p>
                  </div>
                </div>

                {/* Visual Funnel */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${stages[0]?.opportunities ? Math.min(100, (stage.opportunities / stages[0].opportunities) * 100) : 0}%` }}
                    >
                      <span className="text-xs text-white font-bold">{stage.opportunities}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleViewStageDetails(stage)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="View Stage Details"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Stage Details</span>
                  </button>
                  <button
                    onClick={() => handleViewOpportunities(stage)}
                    className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    title="View Opportunities"
                  >
                    <Users className="h-4 w-4" />
                    <span>View Opportunities ({stage.opportunities})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
