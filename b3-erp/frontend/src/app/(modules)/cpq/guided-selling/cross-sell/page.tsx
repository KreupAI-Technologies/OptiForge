'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  TrendingUp,
  Link2,
  Package,
  IndianRupee,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2
} from 'lucide-react';
import {
  AnalyticsModal,
  CreateCampaignModal,
  CrossSellOpportunity as CrossSellOpportunityType
} from '@/components/cpq/CrossSellModals';
import { cpqCrossSellService } from '@/services/cpq/cpq-orphans.service';

interface CrossSellOpportunity {
  id: string;
  primaryProduct: {
    code: string;
    name: string;
    category: string;
    value: number;
  };
  suggestedProduct: {
    code: string;
    name: string;
    category: string;
    value: number;
  };
  relationship: 'complement' | 'essential' | 'upgrade' | 'bundle';
  coOccurrenceRate: number;
  avgAdditionalRevenue: number;
  conversionRate: number;
  customersCount: number;
  totalOpportunityValue: number;
  recommendationStrength: 'strong' | 'medium' | 'weak';
  activeCampaigns: number;
  lastUpdated: string;
}

export default function CrossSellPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  const [filterStrength, setFilterStrength] = useState<'all' | 'strong' | 'medium' | 'weak'>('all');

  // Modal states
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrossSellOpportunity | null>(null);

  const [opportunities, setOpportunities] = useState<CrossSellOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    cpqCrossSellService
      .findAll()
      .then((rows) => {
        if (!active) return;
        const mapped: CrossSellOpportunity[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          primaryProduct: {
            code: r?.primaryProduct?.code ?? '',
            name: r?.primaryProduct?.name ?? '',
            category: r?.primaryProduct?.category ?? '',
            value: Number(r?.primaryProduct?.value) || 0
          },
          suggestedProduct: {
            code: r?.suggestedProduct?.code ?? '',
            name: r?.suggestedProduct?.name ?? '',
            category: r?.suggestedProduct?.category ?? '',
            value: Number(r?.suggestedProduct?.value) || 0
          },
          relationship: (r?.relationship ?? 'complement') as any,
          coOccurrenceRate: Number(r?.coOccurrenceRate) || 0,
          avgAdditionalRevenue: Number(r?.avgAdditionalRevenue) || 0,
          conversionRate: Number(r?.conversionRate) || 0,
          customersCount: Number(r?.customersCount) || 0,
          totalOpportunityValue: Number(r?.totalOpportunityValue) || 0,
          recommendationStrength: (r?.recommendationStrength ?? 'medium') as any,
          activeCampaigns: Number(r?.activeCampaigns) || 0,
          lastUpdated: r?.updatedAt ? String(r.updatedAt).split('T')[0] : ''
        }));
        setOpportunities(mapped);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.message || 'Failed to load cross-sell opportunities');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const relationships = ['all', 'complement', 'essential', 'upgrade', 'bundle'];

  // Handlers
  const handleViewAnalytics = (opportunity: CrossSellOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsAnalyticsOpen(true);
  };

  const handleCreateCampaign = (opportunity?: CrossSellOpportunity) => {
    setSelectedOpportunity(opportunity || null);
    setIsCampaignOpen(true);
  };

  const handleSaveCampaign = (campaign: any) => {
    console.log('Campaign saved:', campaign);
    setIsCampaignOpen(false);
    setSelectedOpportunity(null);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch =
      opp.primaryProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.suggestedProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.primaryProduct.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.suggestedProduct.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRelationship = filterRelationship === 'all' || opp.relationship === filterRelationship;
    const matchesStrength = filterStrength === 'all' || opp.recommendationStrength === filterStrength;

    return matchesSearch && matchesRelationship && matchesStrength;
  });

  const getRelationshipBadge = (relationship: string) => {
    const badges = {
      complement: { color: 'bg-blue-100 text-blue-800', icon: Link2, label: 'Complement' },
      essential: { color: 'bg-red-100 text-red-800', icon: CheckCircle2, label: 'Essential' },
      upgrade: { color: 'bg-purple-100 text-purple-800', icon: TrendingUp, label: 'Upgrade' },
      bundle: { color: 'bg-green-100 text-green-800', icon: Package, label: 'Bundle' }
    };
    return badges[relationship as keyof typeof badges] || badges.complement;
  };

  const getStrengthColor = (strength: string) => {
    const colors = {
      strong: 'text-green-600',
      medium: 'text-orange-600',
      weak: 'text-gray-600'
    };
    return colors[strength as keyof typeof colors] || colors.medium;
  };

  // Summary stats
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, o) => sum + o.totalOpportunityValue, 0);
  const avgConversion = totalOpportunities > 0
    ? opportunities.reduce((sum, o) => sum + o.conversionRate, 0) / totalOpportunities
    : 0;
  const strongOpportunities = opportunities.filter(o => o.recommendationStrength === 'strong').length;

  return (
    <div className="w-full px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cross-Sell Opportunities</h1>
            <p className="text-sm text-gray-600">Identify and capitalize on product pairing opportunities</p>
          </div>
        </div>
        <button
          onClick={() => handleCreateCampaign()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {/* Loading Banner */}
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading cross-sell opportunities...
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Opportunities</span>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalOpportunities}</div>
          <div className="text-xs text-blue-700 mt-1">{strongOpportunities} strong matches</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Total Value</span>
            <IndianRupee className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">₹{(totalValue / 10000000).toFixed(1)}Cr</div>
          <div className="text-xs text-green-700 mt-1">Revenue potential</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Avg Conversion</span>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{avgConversion.toFixed(1)}%</div>
          <div className="text-xs text-purple-700 mt-1">Success rate</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Active Campaigns</span>
            <Sparkles className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {opportunities.reduce((sum, o) => sum + o.activeCampaigns, 0)}
          </div>
          <div className="text-xs text-orange-700 mt-1">Running now</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product pairings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRelationship}
            onChange={(e) => setFilterRelationship(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {relationships.map(rel => (
              <option key={rel} value={rel}>
                {rel === 'all' ? 'All Relationships' : rel.charAt(0).toUpperCase() + rel.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterStrength}
            onChange={(e) => setFilterStrength(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Strengths</option>
            <option value="strong">Strong</option>
            <option value="medium">Medium</option>
            <option value="weak">Weak</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-2">
        {filteredOpportunities.map((opp) => {
          const relInfo = getRelationshipBadge(opp.relationship);
          const RelIcon = relInfo.icon;
          return (
            <div key={opp.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${relInfo.color}`}>
                    <RelIcon className="h-3 w-3" />
                    {relInfo.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className={`text-sm font-medium ${getStrengthColor(opp.recommendationStrength)}`}>
                      {opp.recommendationStrength.toUpperCase()} Match
                    </div>
                    {opp.activeCampaigns > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Sparkles className="h-3 w-3" />
                        {opp.activeCampaigns} Active Campaign{opp.activeCampaigns > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Pairing */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center mb-2">
                  {/* Primary Product */}
                  <div className="md:col-span-2 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-blue-700 mb-1">Primary Product</div>
                        <h4 className="font-semibold text-gray-900">{opp.primaryProduct.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span>{opp.primaryProduct.code}</span>
                          <span>•</span>
                          <span className="font-medium text-blue-900">₹{opp.primaryProduct.value.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Suggested Product */}
                  <div className="md:col-span-2 bg-green-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-green-700 mb-1">Suggested Cross-Sell</div>
                        <h4 className="font-semibold text-gray-900">{opp.suggestedProduct.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span>{opp.suggestedProduct.code}</span>
                          <span>•</span>
                          <span className="font-medium text-green-900">₹{opp.suggestedProduct.value.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Co-Occurrence</div>
                    <div className="text-lg font-bold text-gray-900">{opp.coOccurrenceRate.toFixed(1)}%</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Conversion Rate</div>
                    <div className="text-lg font-bold text-green-900">{opp.conversionRate.toFixed(1)}%</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Avg Revenue</div>
                    <div className="text-lg font-bold text-blue-900">₹{(opp.avgAdditionalRevenue / 1000).toFixed(1)}K</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Customers</div>
                    <div className="text-lg font-bold text-purple-900">{opp.customersCount}</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                    <div className="text-xs text-orange-700 mb-1">Total Opportunity</div>
                    <div className="text-lg font-bold text-orange-900">₹{(opp.totalOpportunityValue / 100000).toFixed(1)}L</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Last updated: {opp.lastUpdated}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewAnalytics(opp)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Analytics
                    </button>
                    <button
                      onClick={() => handleCreateCampaign(opp)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Campaign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredOpportunities.length} of {totalOpportunities} cross-sell opportunities
      </div>

      {/* Modals */}
      {selectedOpportunity && (
        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => {
            setIsAnalyticsOpen(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
        />
      )}

      <CreateCampaignModal
        isOpen={isCampaignOpen}
        onClose={() => {
          setIsCampaignOpen(false);
          setSelectedOpportunity(null);
        }}
        onSave={handleSaveCampaign}
        opportunity={selectedOpportunity || undefined}
      />
    </div>
  );
}
