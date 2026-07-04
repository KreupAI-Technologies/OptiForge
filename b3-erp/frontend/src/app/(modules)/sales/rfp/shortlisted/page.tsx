'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  Calendar,
  Clock,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface EvaluationScore {
  criteria: string;
  weight: number;
  score: number;
  maxScore: number;
  weightedScore: number;
}

interface ShortlistedVendor {
  id: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  quotedAmount: number;
  originalEstimate: number;
  variance: number;
  variancePercent: number;
  deliveryTime: number; // in days
  paymentTerms: string;
  warranty: string;
  rank: number;
  totalScore: number;
  maxTotalScore: number;
  scorePercent: number;
  evaluationScores: EvaluationScore[];
  strengths: string[];
  weaknesses: string[];
  pastPerformance: {
    ordersCompleted: number;
    onTimeDelivery: number;
    qualityRating: number;
    overallRating: number;
  };
  certifications: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'conditional' | 'not_recommended';
  notes?: string;
}

interface ShortlistedRFP {
  id: string;
  rfpNumber: string;
  title: string;
  category: string;
  issueDate: string;
  evaluationDate: string;
  estimatedValue: number;
  shortlistedCount: number;
  totalResponses: number;
  evaluationCriteria: string[];
  status: 'evaluation_complete' | 'awaiting_approval' | 'negotiation' | 'vendor_selected';
  selectedVendorId?: string;
  vendors: ShortlistedVendor[];
}

export default function ShortlistedRFPPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRFP, setSelectedRFP] = useState<string | null>(null);

  const [rfps, setRfps] = useState<ShortlistedRFP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: ShortlistedRFP[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          rfpNumber: r.rfpNumber ?? '',
          title: r.title ?? '',
          category: r.category ?? '',
          issueDate: r.issueDate ?? '',
          evaluationDate: r.evaluationDate ?? '',
          estimatedValue: r.estimatedValue ?? 0,
          shortlistedCount: r.shortlistedCount ?? 0,
          totalResponses: r.totalResponses ?? 0,
          evaluationCriteria: r.evaluationCriteria ?? [],
          status: (r.status ?? 'evaluation_complete') as ShortlistedRFP['status'],
          selectedVendorId: r.selectedVendorId,
          vendors: (r.vendors ?? []).map((v: any) => ({
            id: String(v.id ?? ''),
            vendorName: v.vendorName ?? '',
            contactPerson: v.contactPerson ?? '',
            email: v.email ?? '',
            phone: v.phone ?? '',
            location: v.location ?? '',
            quotedAmount: v.quotedAmount ?? 0,
            originalEstimate: v.originalEstimate ?? 0,
            variance: v.variance ?? 0,
            variancePercent: v.variancePercent ?? 0,
            deliveryTime: v.deliveryTime ?? 0,
            paymentTerms: v.paymentTerms ?? '',
            warranty: v.warranty ?? '',
            rank: v.rank ?? 0,
            totalScore: v.totalScore ?? 0,
            maxTotalScore: v.maxTotalScore ?? 0,
            scorePercent: v.scorePercent ?? 0,
            evaluationScores: (v.evaluationScores ?? []).map((s: any) => ({
              criteria: s.criteria ?? '',
              weight: s.weight ?? 0,
              score: s.score ?? 0,
              maxScore: s.maxScore ?? 0,
              weightedScore: s.weightedScore ?? 0
            })),
            strengths: v.strengths ?? [],
            weaknesses: v.weaknesses ?? [],
            pastPerformance: {
              ordersCompleted: v.pastPerformance?.ordersCompleted ?? 0,
              onTimeDelivery: v.pastPerformance?.onTimeDelivery ?? 0,
              qualityRating: v.pastPerformance?.qualityRating ?? 0,
              overallRating: v.pastPerformance?.overallRating ?? 0
            },
            certifications: v.certifications ?? [],
            recommendation: (v.recommendation ?? 'recommended') as ShortlistedVendor['recommendation'],
            notes: v.notes
          }))
        }));
        if (!cancelled) setRfps(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRfps([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredRFPs = rfps.filter(rfp => {
    const matchesSearch =
      rfp.rfpNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || rfp.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return 'bg-green-100 text-green-700 border-green-300';
      case 'recommended': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'conditional': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'not_recommended': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return 'Highly Recommended';
      case 'recommended': return 'Recommended';
      case 'conditional': return 'Conditional';
      case 'not_recommended': return 'Not Recommended';
      default: return recommendation;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluation_complete': return 'bg-blue-100 text-blue-700';
      case 'awaiting_approval': return 'bg-yellow-100 text-yellow-700';
      case 'negotiation': return 'bg-purple-100 text-purple-700';
      case 'vendor_selected': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'evaluation_complete': return 'Evaluation Complete';
      case 'awaiting_approval': return 'Awaiting Approval';
      case 'negotiation': return 'In Negotiation';
      case 'vendor_selected': return 'Vendor Selected';
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 px-3 py-2">
      <div className="space-y-3">
        {/* Inline Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Export Comparison
            </button>
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors">
              Approve Selection
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search RFPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="evaluation_complete">Evaluation Complete</option>
              <option value="awaiting_approval">Awaiting Approval</option>
              <option value="negotiation">In Negotiation</option>
              <option value="vendor_selected">Vendor Selected</option>
            </select>
          </div>
        </div>

        {/* RFPs List */}
        <div className="space-y-3">
          {filteredRFPs.map((rfp) => (
            <div key={rfp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="space-y-3">
                {/* RFP Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{rfp.rfpNumber}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rfp.status)}`}>
                        {getStatusLabel(rfp.status)}
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-2">{rfp.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Evaluated: {new Date(rfp.evaluationDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{rfp.shortlistedCount} of {rfp.totalResponses} shortlisted</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>Est: ₹{(rfp.estimatedValue / 100000).toFixed(2)}L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendors Comparison */}
                <div className="space-y-2">
                  {rfp.vendors.map((vendor, index) => (
                    <div
                      key={vendor.id}
                      className={`border-2 rounded-xl p-3 transition-all ${
                        rfp.selectedVendorId === vendor.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Vendor Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                              vendor.rank === 1 ? 'bg-yellow-500' :
                              vendor.rank === 2 ? 'bg-gray-400' :
                              'bg-orange-400'
                            }`}>
                              {vendor.rank}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{vendor.vendorName}</h3>
                                {rfp.selectedVendorId === vendor.id && (
                                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    SELECTED
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{vendor.contactPerson}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{vendor.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{vendor.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{vendor.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium ${getRecommendationColor(vendor.recommendation)}`}>
                            {getRecommendationLabel(vendor.recommendation)}
                          </div>
                        </div>

                        {/* Score and Price */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-3 text-white">
                            <p className="text-emerald-100 text-sm font-medium">Overall Score</p>
                            <p className="text-3xl font-bold mt-1">{vendor.scorePercent}%</p>
                            <p className="text-emerald-100 text-xs mt-1">{vendor.totalScore}/{vendor.maxTotalScore} points</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-3 text-white">
                            <p className="text-blue-100 text-sm font-medium">Quoted Amount</p>
                            <p className="text-2xl font-bold mt-1">₹{(vendor.quotedAmount / 100000).toFixed(2)}L</p>
                            <p className={`text-xs mt-1 flex items-center gap-1 ${vendor.variance < 0 ? 'text-green-200' : 'text-red-200'}`}>
                              {vendor.variance < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                              {vendor.variancePercent > 0 ? '+' : ''}{vendor.variancePercent}% vs estimate
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 text-white">
                            <p className="text-purple-100 text-sm font-medium">Delivery Time</p>
                            <p className="text-3xl font-bold mt-1">{vendor.deliveryTime}</p>
                            <p className="text-purple-100 text-xs mt-1">days</p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-3 text-white">
                            <p className="text-orange-100 text-sm font-medium">Overall Rating</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-3xl font-bold">{vendor.pastPerformance.overallRating}</span>
                              {renderStars(vendor.pastPerformance.overallRating)}
                            </div>
                          </div>
                        </div>

                        {/* Evaluation Scores */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-900 mb-3">Evaluation Breakdown</h4>
                          <div className="space-y-3">
                            {vendor.evaluationScores.map((score, idx) => (
                              <div key={idx}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-700">{score.criteria}</span>
                                  <span className="font-semibold text-gray-900">{score.weightedScore}/{score.maxScore}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(score.weightedScore / score.maxScore) * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Strengths and Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {vendor.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                              <ThumbsDown className="w-4 h-4" />
                              Weaknesses
                            </h4>
                            <ul className="space-y-1">
                              {vendor.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                  <span className="text-red-600 mt-0.5">•</span>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-semibold text-blue-900 mb-2">Payment Terms</h4>
                            <p className="text-sm text-blue-800">{vendor.paymentTerms}</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <h4 className="font-semibold text-purple-900 mb-2">Warranty</h4>
                            <p className="text-sm text-purple-800">{vendor.warranty}</p>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <h4 className="font-semibold text-orange-900 mb-2">Past Performance</h4>
                            <div className="space-y-1 text-sm text-orange-800">
                              <p>{vendor.pastPerformance.ordersCompleted} orders completed</p>
                              <p>{vendor.pastPerformance.onTimeDelivery}% on-time delivery</p>
                            </div>
                          </div>
                        </div>

                        {/* Certifications */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-700">Certifications:</span>
                          {vendor.certifications.map((cert, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {cert}
                            </span>
                          ))}
                        </div>

                        {/* Notes */}
                        {vendor.notes && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">{vendor.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                          {rfp.selectedVendorId !== vendor.id ? (
                            <>
                              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors">
                                Select Vendor
                              </button>
                              <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                Negotiate
                              </button>
                            </>
                          ) : (
                            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Proceed to Contract
                            </button>
                          )}
                          <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRFPs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shortlisted RFPs Found</h3>
            <p className="text-gray-600">No RFPs match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
