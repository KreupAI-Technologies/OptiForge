'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AILeadScoreCard } from '@/components/crm';
import type { AILeadScore } from '@/components/crm';
import { ArrowLeft } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface ScoredLead {
  leadName: string;
  leadCompany: string;
  score: AILeadScore;
}

function num(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapRating(raw: any, score: number): AILeadScore['rating'] {
  const r = String(raw ?? '').toLowerCase();
  if (r === 'hot' || r === 'warm' || r === 'cold') return r;
  if (score >= 70) return 'hot';
  if (score >= 45) return 'warm';
  return 'cold';
}

function mapTrend(raw: any, current: number, previous: number): AILeadScore['trend'] {
  const t = String(raw ?? '').toLowerCase();
  if (t === 'up' || t === 'down' || t === 'stable') return t;
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

/** Defensively map an arbitrary lead-scoring record onto the AILeadScore interface. */
function toScore(raw: any): AILeadScore {
  const src = raw ?? {};
  const factors = src.factors ?? {};
  const prediction = src.prediction ?? {};

  const currentScore = num(src.currentScore ?? src.score ?? src.leadScore);
  const previousScore = num(src.previousScore ?? src.priorScore ?? currentScore, currentScore);

  return {
    currentScore,
    previousScore,
    prediction: {
      conversionProbability: num(prediction.conversionProbability ?? src.conversionProbability),
      timeToConvert: num(prediction.timeToConvert ?? src.timeToConvert),
      recommendedActions: Array.isArray(prediction.recommendedActions)
        ? prediction.recommendedActions.map((a: any) => String(a))
        : Array.isArray(src.recommendedActions)
        ? src.recommendedActions.map((a: any) => String(a))
        : [],
      confidence: num(prediction.confidence ?? src.confidence),
    },
    factors: {
      companySize: num(factors.companySize),
      revenue: num(factors.revenue),
      engagement: num(factors.engagement),
      interest: num(factors.interest),
      sourceQuality: num(factors.sourceQuality),
      behavior: num(factors.behavior),
      demographic: num(factors.demographic),
      firmographic: num(factors.firmographic),
    },
    rating: mapRating(src.rating, currentScore),
    trend: mapTrend(src.trend, currentScore, previousScore),
  };
}

function toScoredLead(raw: any): ScoredLead {
  const src = raw ?? {};
  return {
    leadName: src.leadName ?? src.name ?? src.contactName ?? 'Unknown Lead',
    leadCompany: src.leadCompany ?? src.company ?? src.companyName ?? src.account ?? '',
    score: toScore(src.score ?? src),
  };
}

/**
 * The lead-scoring endpoint returns an aggregate object (not an array). It may
 * carry an array of scored leads under one of several field names, plus summary
 * numbers. Read everything defensively.
 */
function mapLeadScoring(data: any): { leads: ScoredLead[]; primary: AILeadScore | null } {
  const agg = data ?? {};

  const rawLeads =
    (Array.isArray(agg.scores) && agg.scores) ||
    (Array.isArray(agg.leads) && agg.leads) ||
    (Array.isArray(agg.scoredLeads) && agg.scoredLeads) ||
    (Array.isArray(agg.results) && agg.results) ||
    (Array.isArray(agg.items) && agg.items) ||
    (Array.isArray(agg.data) && agg.data) ||
    [];

  const leads: ScoredLead[] = (Array.isArray(rawLeads) ? rawLeads : []).map(toScoredLead);

  // If the aggregate itself looks like a single score summary, surface it.
  const hasSummary =
    agg.currentScore != null ||
    agg.averageScore != null ||
    agg.score != null ||
    agg.prediction != null ||
    agg.factors != null;

  const primary = leads.length > 0 ? leads[0].score : hasSummary ? toScore(agg) : null;

  return { leads, primary };
}

export default function AILeadScoringPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [primaryScore, setPrimaryScore] = useState<AILeadScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.crmAnalytics.getLeadScoring();
        if (cancelled) return;
        const { leads: mappedLeads, primary } = mapLeadScoring(data);
        setLeads(mappedLeads);
        setPrimaryScore(primary);
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(err?.message ?? 'Failed to load lead scoring.');
        setLeads([]);
        setPrimaryScore(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAcceptRecommendation = (action: string) => {
    console.log('Recommendation accepted:', action);
  };

  const handleRejectRecommendation = (action: string) => {
    console.log('Recommendation rejected:', action);
  };

  const featured = leads[0];
  const compactLeads = leads.slice(1);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-1 px-3 py-2 overflow-auto">
        <button
          onClick={() => router.push('/crm/advanced-features')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Advanced Features
        </button>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Lead Scoring</h2>
            <p className="text-gray-600 mb-2">
              Machine learning algorithms analyze multiple factors to predict conversion probability and
              recommend next best actions.
            </p>
            {featured ? (
              <AILeadScoreCard
                leadName={featured.leadName}
                leadCompany={featured.leadCompany}
                score={featured.score}
                onAcceptRecommendation={handleAcceptRecommendation}
                onRejectRecommendation={handleRejectRecommendation}
                showPredictions={true}
              />
            ) : primaryScore ? (
              <AILeadScoreCard
                leadName="Top Lead"
                leadCompany=""
                score={primaryScore}
                onAcceptRecommendation={handleAcceptRecommendation}
                onRejectRecommendation={handleRejectRecommendation}
                showPredictions={true}
              />
            ) : (
              !isLoading && (
                <div className="py-8 text-center text-sm text-gray-500">No lead scoring data available.</div>
              )
            )}
          </div>

          {compactLeads.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Compact View</h3>
              <div className="space-y-3">
                {compactLeads.map((lead, idx) => (
                  <AILeadScoreCard
                    key={`${lead.leadName}-${idx}`}
                    leadName={lead.leadName}
                    leadCompany={lead.leadCompany}
                    score={lead.score}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
