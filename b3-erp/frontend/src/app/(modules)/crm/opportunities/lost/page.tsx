'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  XCircle,
  TrendingDown,
  AlertTriangle,
  Eye,
  RotateCcw,
  Download,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  FileText,
  MessageSquare,
  Info,
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface LostOpportunity {
  id: string;
  name: string;
  accountName: string;
  contactName: string;
  value: number;
  lostDate: string;
  daysInPipeline: number;
  owner: string;
  products: string[];
  source: string;
  stage: string;
  lostReason: string;
  lostToCompetitor: string;
  competitorPrice?: number;
  ourPrice: number;
  feedback?: string;
  createdDate: string;
  followUpDate?: string;
  canReopen: boolean;
}

export default function LostOpportunitiesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [opportunities, setOpportunities] = useState<LostOpportunity[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.opportunityViews.getLost();
        if (!active) return;
        const rows = Array.isArray(data?.opportunities) ? data.opportunities : [];
        setOpportunities(
          rows.map((o: any) => ({
            id: String(o?.id ?? ''),
            name: o?.name ?? '',
            accountName: o?.account ?? '',
            contactName: o?.contact ?? '',
            value: Number(o?.value ?? 0),
            lostDate: o?.expectedCloseDate ?? '',
            daysInPipeline: 0,
            owner: o?.owner ?? '',
            products: [],
            source: o?.source ?? '',
            stage: o?.stage ?? '',
            lostReason: '',
            lostToCompetitor: '',
            ourPrice: Number(o?.value ?? 0),
            createdDate: '',
            canReopen: true,
          })),
        );
      } catch {
        if (active) setOpportunities([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [lostReasonFilter, setLostReasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lostDate');

  // Calculate statistics
  const stats = {
    totalLost: opportunities.length,
    totalValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
    avgDealSize: opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length,
    avgDaysInPipeline: Math.round(
      opportunities.reduce((sum, opp) => sum + opp.daysInPipeline, 0) / opportunities.length
    ),
    canReopenCount: opportunities.filter((opp) => opp.canReopen).length,
    priceLosses: opportunities.filter((opp) => opp.lostReason === 'Price too high').length,
  };

  // Loss reasons breakdown
  const lossReasonCounts = opportunities.reduce((acc, opp) => {
    acc[opp.lostReason] = (acc[opp.lostReason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLossReasons = Object.entries(lossReasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Competitor analysis
  const competitorWins = opportunities.reduce((acc, opp) => {
    if (opp.lostToCompetitor && opp.lostToCompetitor !== 'N/A - Project on hold') {
      acc[opp.lostToCompetitor] = (acc[opp.lostToCompetitor] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCompetitors = Object.entries(competitorWins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filteredOpportunities = opportunities
    .filter((opp) => {
      const matchesSearch =
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.accountName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesReason =
        lostReasonFilter === 'all' || opp.lostReason === lostReasonFilter;
      return matchesSearch && matchesReason;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value - a.value;
        case 'lostDate':
          return new Date(b.lostDate).getTime() - new Date(a.lostDate).getTime();
        case 'daysInPipeline':
          return b.daysInPipeline - a.daysInPipeline;
        default:
          return 0;
      }
    });

  const getLostReasonColor = (reason: string) => {
    switch (reason) {
      case 'Price too high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Timeline too long':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Lost in tender':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Project cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Better design from competitor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  // Handler for Analysis button
  const handleAnalyzeLoss = (opp: LostOpportunity) => {
    // In a real application, this would navigate to a loss analysis page or open a modal
    addToast({
      title: 'Loss Analysis',
      message: `Analyzing loss for "${opp.name}". This will provide insights into why the deal was lost and how to improve.`,
      variant: 'success'
    });
    // Future implementation: router.push(`/crm/opportunities/loss-analysis/${opp.id}`)
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Lost</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.totalLost}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Lost Value</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                ${(stats.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                ${(stats.avgDealSize / 1000).toFixed(0)}K
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Days</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.avgDaysInPipeline}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Can Reopen</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.canReopenCount}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Loss Reasons & Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Top Loss Reasons */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Top Loss Reasons</h2>
          </div>
          <div className="space-y-3">
            {topLossReasons.map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{reason}</p>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(count / opportunities.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold text-gray-700">
                  {count} ({((count / opportunities.length) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Competitors */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Lost to Competitors</h2>
          </div>
          <div className="space-y-3">
            {topCompetitors.map(([competitor, count], index) => (
              <div
                key={competitor}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{competitor}</p>
                    <p className="text-sm text-gray-500">{count} wins against us</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lost opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <select
            value={lostReasonFilter}
            onChange={(e) => setLostReasonFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Reasons</option>
            {Object.keys(lossReasonCounts).map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="lostDate">Sort by: Lost Date</option>
            <option value="value">Sort by: Value</option>
            <option value="daysInPipeline">Sort by: Days in Pipeline</option>
          </select>
        </div>
      </div>

      {/* Lost Opportunities List */}
      <div className="space-y-2">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-lg border-2 border-red-200 p-3 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Left Side */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <h3 className="text-xl font-bold text-gray-900">{opp.name}</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                    LOST
                  </span>
                  {opp.canReopen && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Can Reopen
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-medium">{opp.accountName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{opp.contactName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Lost: {new Date(opp.lostDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{opp.daysInPipeline} days in pipeline</span>
                  </div>
                </div>

                {/* Loss Reason */}
                <div className="mb-2">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full border ${getLostReasonColor(
                      opp.lostReason
                    )}`}
                  >
                    {opp.lostReason}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {opp.products.map((product) => (
                    <span
                      key={product}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                    >
                      {product}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-500">Stage: </span>
                    <span className="font-semibold text-gray-900">{opp.stage}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner: </span>
                    <span className="font-semibold text-gray-900">{opp.owner}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lost to: </span>
                    <span className="font-semibold text-red-700">{opp.lostToCompetitor}</span>
                  </div>
                  {opp.followUpDate && (
                    <div>
                      <span className="text-gray-500">Follow-up: </span>
                      <span className="font-semibold text-green-700">
                        {new Date(opp.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Comparison */}
                {opp.competitorPrice && (
                  <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Our Price</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${(opp.ourPrice / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-600">Competitor Price</p>
                        <p className="text-lg font-bold text-red-700">
                          ${(opp.competitorPrice / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Difference</p>
                        <p className="text-lg font-bold text-amber-700">
                          ${((opp.ourPrice - opp.competitorPrice) / 1000).toFixed(0)}K (
                          {(((opp.ourPrice - opp.competitorPrice) / opp.ourPrice) * 100).toFixed(1)}
                          %)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {opp.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Customer Feedback</p>
                        <p className="text-sm text-gray-700">"{opp.feedback}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Value Info */}
              <div className="ml-6 text-right">
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-sm font-medium text-red-600 mb-1">Lost Value</p>
                  <p className="text-3xl font-bold text-red-900 mb-2">
                    ${(opp.value / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => router.push(`/crm/opportunities/view/${opp.id}`)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  {opp.canReopen && (
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <RotateCcw className="h-4 w-4" />
                      <span>Reopen</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleAnalyzeLoss(opp)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Analysis</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Info className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No lost opportunities found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
