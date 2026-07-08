'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  ShoppingCart,
  Star,
  ThumbsUp,
  Filter,
  Brain,
  BarChart3,
  Package,
  Loader2
} from 'lucide-react';
import {
  SendToCustomerModal,
  AddToQuoteModal,
  GenerateRecommendationModal,
  Recommendation as RecommendationType
} from '@/components/cpq/RecommendationModals';
import { cpqRecommendationService } from '@/services/cpq/cpq-orphans.service';

interface Recommendation {
  id: string;
  customerId: string;
  customerName: string;
  segment: string;
  productCode: string;
  productName: string;
  category: string;
  recommendationType: 'best-match' | 'upgrade' | 'alternative' | 'frequently-bought' | 'trending';
  confidenceScore: number;
  estimatedValue: number;
  reason: string;
  basedOn: string;
  priority: 'high' | 'medium' | 'low';
  aiGenerated: boolean;
  acceptanceRate: number;
  createdDate: string;
  expiresDate: string;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Modal states
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await cpqRecommendationService.findAll();
      const mapped: Recommendation[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: r.id ?? '',
        customerId: r.customerId ?? '',
        customerName: r.customerName ?? '',
        segment: r.segment ?? '',
        productCode: r.productCode ?? '',
        productName: r.productName ?? '',
        category: r.category ?? '',
        recommendationType: (r.recommendationType ?? 'best-match') as any,
        confidenceScore: Number(r.confidenceScore) || 0,
        estimatedValue: Number(r.estimatedValue) || 0,
        reason: r.reason ?? '',
        basedOn: r.basedOn ?? '',
        priority: (r.priority ?? 'medium') as any,
        aiGenerated: Boolean(r.aiGenerated),
        acceptanceRate: Number(r.acceptanceRate) || 0,
        createdDate: r.createdAt ? String(r.createdAt).split('T')[0] : '',
        expiresDate: r.expiresDate ? String(r.expiresDate).split('T')[0] : ''
      }));
      setRecommendations(mapped);
    } catch (err: any) {
      setError(err?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const types = ['all', 'best-match', 'upgrade', 'alternative', 'frequently-bought', 'trending'];

  // Handlers
  const handleSendToCustomer = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsSendModalOpen(true);
  };

  const handleAddToQuote = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsQuoteModalOpen(true);
  };

  const handleGenerateNew = () => {
    setIsGenerateModalOpen(true);
  };

  const handleGenerateRecommendation = async (recommendation: Recommendation) => {
    setIsSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await cpqRecommendationService.create({
        customerId: recommendation.customerId || null,
        customerName: recommendation.customerName || null,
        segment: recommendation.segment || null,
        productCode: recommendation.productCode || null,
        productName: recommendation.productName || null,
        category: recommendation.category || null,
        recommendationType: recommendation.recommendationType as any,
        confidenceScore: Number(recommendation.confidenceScore) || 0,
        estimatedValue: Number(recommendation.estimatedValue) || 0,
        reason: recommendation.reason || null,
        basedOn: recommendation.basedOn || null,
        priority: recommendation.priority as any,
        aiGenerated: Boolean(recommendation.aiGenerated),
        acceptanceRate: Number(recommendation.acceptanceRate) || 0,
        expiresDate: recommendation.expiresDate || null,
      });
      setActionSuccess('Recommendation generated and saved.');
      setIsGenerateModalOpen(false);
      await loadRecommendations();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save recommendation');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch =
      rec.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.customerId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || rec.recommendationType === filterType;
    const matchesPriority = filterPriority === 'all' || rec.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const getTypeBadge = (type: string) => {
    const badges = {
      'best-match': { color: 'bg-green-100 text-green-800', icon: Target, label: 'Best Match' },
      'upgrade': { color: 'bg-blue-100 text-blue-800', icon: TrendingUp, label: 'Upgrade' },
      'alternative': { color: 'bg-purple-100 text-purple-800', icon: Filter, label: 'Alternative' },
      'frequently-bought': { color: 'bg-orange-100 text-orange-800', icon: ShoppingCart, label: 'Frequently Bought' },
      'trending': { color: 'bg-pink-100 text-pink-800', icon: Star, label: 'Trending' }
    };
    return badges[type as keyof typeof badges] || badges['best-match'];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-orange-600 bg-orange-50 border-orange-200',
      low: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Summary stats
  const totalRecommendations = recommendations.length;
  const avgConfidence = totalRecommendations > 0
    ? recommendations.reduce((sum, r) => sum + r.confidenceScore, 0) / totalRecommendations
    : 0;
  const highPriority = recommendations.filter(r => r.priority === 'high').length;
  const aiGenerated = recommendations.filter(r => r.aiGenerated).length;

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
            <h1 className="text-2xl font-bold text-gray-900">Product Recommendations</h1>
            <p className="text-sm text-gray-600">AI-powered intelligent product suggestions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateNew}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Brain className="h-4 w-4" />
            Generate New
          </button>
        </div>
      </div>

      {/* Loading Banner */}
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading recommendations...</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Action Feedback */}
      {actionSuccess && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </div>
      )}
      {isSaving && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving recommendation…
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Recommendations</span>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalRecommendations}</div>
          <div className="text-xs text-blue-700 mt-1">{aiGenerated} AI-generated</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Avg Confidence</span>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{avgConfidence.toFixed(1)}%</div>
          <div className="text-xs text-green-700 mt-1">Prediction accuracy</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900">High Priority</span>
            <TrendingUp className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{highPriority}</div>
          <div className="text-xs text-red-700 mt-1">Immediate action</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Potential Value</span>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ₹{(recommendations.reduce((sum, r) => sum + r.estimatedValue, 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-xs text-purple-700 mt-1">Total opportunity</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2">
        {filteredRecommendations.map((rec) => {
          const typeInfo = getTypeBadge(rec.recommendationType);
          const TypeIcon = typeInfo.icon;
          return (
            <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rec.customerName}</h3>
                        <p className="text-xs text-gray-500">{rec.customerId} • {rec.segment}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                      <TypeIcon className="h-3 w-3" />
                      {typeInfo.label}
                    </span>
                    {rec.aiGenerated && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Brain className="h-3 w-3" />
                        AI
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Product Info */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                      <Package className="h-6 w-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{rec.productName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{rec.productCode}</span>
                          <span>•</span>
                          <span>{rec.category}</span>
                          <span>•</span>
                          <span className="font-medium text-blue-900">₹{rec.estimatedValue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Why this recommendation?</p>
                          <p className="text-sm text-gray-600">{rec.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Based on: {rec.basedOn}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className={`border rounded-lg p-3 ${getPriorityColor(rec.priority)}`}>
                      <div className="text-xs font-medium mb-1">Priority</div>
                      <div className="text-lg font-bold capitalize">{rec.priority}</div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Confidence Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${rec.confidenceScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-green-900">{rec.confidenceScore.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Acceptance Rate</div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{rec.acceptanceRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {rec.createdDate} • Expires {rec.expiresDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendToCustomer(rec)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Send to Customer
                    </button>
                    <button
                      onClick={() => handleAddToQuote(rec)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Add to Quote
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
        Showing {filteredRecommendations.length} of {totalRecommendations} recommendations
      </div>

      {/* Modals */}
      <GenerateRecommendationModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateRecommendation}
      />

      {selectedRecommendation && (
        <>
          <SendToCustomerModal
            isOpen={isSendModalOpen}
            onClose={() => {
              setIsSendModalOpen(false);
              setSelectedRecommendation(null);
            }}
            recommendation={selectedRecommendation}
          />

          <AddToQuoteModal
            isOpen={isQuoteModalOpen}
            onClose={() => {
              setIsQuoteModalOpen(false);
              setSelectedRecommendation(null);
            }}
            recommendation={selectedRecommendation}
          />
        </>
      )}
    </div>
  );
}
