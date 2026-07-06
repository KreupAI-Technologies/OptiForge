'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, Mail, Users, DollarSign, Eye, MousePointer, Activity, Calendar } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';

interface CampaignPerformance {
  campaignId: string;
  name: string;
  type: string;
  period: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  roi: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  costPerLead: number;
  costPerAcquisition: number;
}

export default function CampaignPerformancePage() {
  const [performanceData, setPerformanceData] = useState<CampaignPerformance[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data: any = await crmService.emailCampaigns.getPerformance();
        if (!active) return;
        const emailRows = asArray(data?.emailCampaigns);
        const campaignRows = asArray(data?.campaigns);
        const mapped: CampaignPerformance[] = [
          ...emailRows.map((e: any) => ({
            campaignId: String(e?.id ?? ''),
            name: e?.name ?? '',
            type: e?.type ?? 'email',
            period: '',
            sent: Number(e?.sent ?? 0),
            delivered: Number(e?.delivered ?? 0),
            opened: Number(e?.opened ?? 0),
            clicked: Number(e?.clicked ?? 0),
            converted: 0,
            revenue: 0,
            roi: 0,
            openRate: Number(e?.openRate ?? 0),
            clickRate: Number(e?.clickRate ?? 0),
            conversionRate: 0,
            costPerLead: 0,
            costPerAcquisition: 0,
          })),
          ...campaignRows.map((c: any) => ({
            campaignId: String(c?.id ?? ''),
            name: c?.name ?? '',
            type: c?.type ?? '',
            period: '',
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: Number(c?.conversions ?? 0),
            revenue: Number(c?.revenue ?? 0),
            roi: Number(c?.roi ?? 0),
            openRate: 0,
            clickRate: Number(c?.clickRate ?? 0),
            conversionRate: Number(c?.conversionRate ?? 0),
            costPerLead: 0,
            costPerAcquisition: 0,
          })),
        ];
        setPerformanceData(mapped);
      } catch {
        if (active) setPerformanceData([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'revenue' | 'roi' | 'conversion'>('revenue');

  const sortedData = [...performanceData].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.revenue - a.revenue;
      case 'roi':
        return b.roi - a.roi;
      case 'conversion':
        return b.conversionRate - a.conversionRate;
      default:
        return 0;
    }
  });

  const count = performanceData.length || 1;
  const totals = {
    sent: performanceData.reduce((sum, c) => sum + c.sent, 0),
    opened: performanceData.reduce((sum, c) => sum + c.opened, 0),
    clicked: performanceData.reduce((sum, c) => sum + c.clicked, 0),
    converted: performanceData.reduce((sum, c) => sum + c.converted, 0),
    revenue: performanceData.reduce((sum, c) => sum + c.revenue, 0),
    avgOpenRate: performanceData.reduce((sum, c) => sum + c.openRate, 0) / count,
    avgClickRate: performanceData.reduce((sum, c) => sum + c.clickRate, 0) / count,
    avgConversionRate: performanceData.reduce((sum, c) => sum + c.conversionRate, 0) / count,
  };
  const sentSafe = totals.sent || 1;

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="mb-8">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Year
          </button>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{(totals.sent / 1000).toFixed(1)}K</div>
            <div className="text-sm text-gray-600 mb-2">Total Sent</div>
            <div className="text-xs text-green-600 font-medium">+12.5% vs last period</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totals.avgOpenRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mb-2">Avg Open Rate</div>
            <div className="text-xs text-green-600 font-medium">+3.2% vs last period</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totals.avgClickRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mb-2">Avg Click Rate</div>
            <div className="text-xs text-green-600 font-medium">+1.8% vs last period</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${(totals.revenue / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
            <div className="text-xs text-green-600 font-medium">+18.7% vs last period</div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Conversion Funnel</h2>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Sent</span>
                <span className="text-sm font-bold text-gray-900">{totals.sent.toLocaleString()} (100%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ width: '100%' }}>
                  {totals.sent.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Opened</span>
                <span className="text-sm font-bold text-gray-900">
                  {totals.opened.toLocaleString()} ({((totals.opened / sentSafe) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-purple-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(totals.opened / sentSafe) * 100}%` }}
                >
                  {totals.opened.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Clicked</span>
                <span className="text-sm font-bold text-gray-900">
                  {totals.clicked.toLocaleString()} ({((totals.clicked / sentSafe) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-orange-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(totals.clicked / sentSafe) * 100}%` }}
                >
                  {totals.clicked.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Converted</span>
                <span className="text-sm font-bold text-gray-900">
                  {totals.converted.toLocaleString()} ({((totals.converted / sentSafe) * 100).toFixed(2)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-green-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(totals.converted / sentSafe) * 100 * 10}%`, minWidth: '80px' }}
                >
                  {totals.converted.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">Campaign Comparison</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="roi">Sort by ROI</option>
            <option value="conversion">Sort by Conversion Rate</option>
          </select>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="space-y-2">
        {sortedData.map((campaign, index) => (
          <div key={campaign.campaignId} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                #{index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{campaign.type}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {campaign.period}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 mb-1">Sent</div>
                <div className="text-lg font-bold text-blue-900">{campaign.sent.toLocaleString()}</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-600 mb-1">Open Rate</div>
                <div className="text-lg font-bold text-purple-900">{campaign.openRate.toFixed(1)}%</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-orange-600 mb-1">Click Rate</div>
                <div className="text-lg font-bold text-orange-900">{campaign.clickRate.toFixed(1)}%</div>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 mb-1">Conversions</div>
                <div className="text-lg font-bold text-green-900">{campaign.converted}</div>
              </div>

              <div className="bg-teal-50 rounded-lg p-3">
                <div className="text-xs text-teal-600 mb-1">Revenue</div>
                <div className="text-lg font-bold text-teal-900">${(campaign.revenue / 1000).toFixed(0)}K</div>
              </div>

              <div className="bg-pink-50 rounded-lg p-3">
                <div className="text-xs text-pink-600 mb-1">ROI</div>
                <div className="text-lg font-bold text-pink-900">{campaign.roi.toFixed(0)}%</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-600 mb-1">Conversion Rate</div>
                <div className="text-sm font-bold text-gray-900">{campaign.conversionRate.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Cost Per Lead</div>
                <div className="text-sm font-bold text-gray-900">${campaign.costPerLead}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Cost Per Acquisition</div>
                <div className="text-sm font-bold text-gray-900">${campaign.costPerAcquisition.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
