'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface TrendPoint {
  period: string;
  avgRating: number;
  reviewCount: number;
  avgGoalProgress: number;
  goalCount: number;
}

const numOrNull = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Derive a cycle/period label from a review or goal row. */
const periodOf = (row: any, fallback: string): string => {
  const d = (row?.data && typeof row.data === 'object') ? row.data : {};
  const explicit =
    row?.cycleName ?? row?.cycle?.cycleName ?? row?.period ?? d?.period ?? d?.cycleName;
  if (explicit) return String(explicit);
  const dateStr = row?.finalizedAt ?? row?.updatedAt ?? row?.createdAt ?? d?.dueDate;
  if (dateStr) {
    const dt = new Date(dateStr);
    if (!Number.isNaN(dt.getTime())) {
      const q = Math.floor(dt.getMonth() / 3) + 1;
      return `Q${q} ${dt.getFullYear()}`;
    }
  }
  return fallback;
};

export default function PerformanceTrendsPage() {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [reviews, goals] = await Promise.all([
          HrPagesService.performanceReviews<any[]>().catch(() => []),
          HrPagesService.performanceGoals<any[]>().catch(() => []),
        ]);
        const rv = Array.isArray(reviews) ? reviews : [];
        const gl = Array.isArray(goals) ? goals : [];

        // Aggregate reviews and goals by period.
        const buckets = new Map<
          string,
          { ratingSum: number; ratingN: number; progressSum: number; progressN: number }
        >();
        const ensure = (p: string) => {
          if (!buckets.has(p)) buckets.set(p, { ratingSum: 0, ratingN: 0, progressSum: 0, progressN: 0 });
          return buckets.get(p)!;
        };

        rv.forEach((r) => {
          const rating = numOrNull(r?.finalRating ?? r?.overallRating ?? r?.managerRating ?? r?.rating);
          if (rating == null) return;
          const b = ensure(periodOf(r, 'Unscheduled'));
          b.ratingSum += rating;
          b.ratingN += 1;
        });

        gl.forEach((g) => {
          const d = (g?.data && typeof g.data === 'object') ? g.data : {};
          const progress = num(d?.progress ?? g?.progress);
          const b = ensure(periodOf(g, 'Unscheduled'));
          b.progressSum += progress;
          b.progressN += 1;
        });

        const points: TrendPoint[] = Array.from(buckets.entries())
          .map(([period, b]) => ({
            period,
            avgRating: b.ratingN > 0 ? b.ratingSum / b.ratingN : 0,
            reviewCount: b.ratingN,
            avgGoalProgress: b.progressN > 0 ? Math.round(b.progressSum / b.progressN) : 0,
            goalCount: b.progressN,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));

        if (!cancelled) setTrend(points);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load performance trends');
          setTrend([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxRating = 5;
  const overall = useMemo(() => {
    const withRating = trend.filter((t) => t.reviewCount > 0);
    const avg =
      withRating.length > 0
        ? withRating.reduce((s, t) => s + t.avgRating, 0) / withRating.length
        : 0;
    const totalReviews = trend.reduce((s, t) => s + t.reviewCount, 0);
    const totalGoals = trend.reduce((s, t) => s + t.goalCount, 0);
    return { avg, totalReviews, totalGoals, periods: trend.length };
  }, [trend]);

  return (
    <div className="p-6 space-y-4">
      <div className="mb-1">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          Performance Trends
        </h1>
        <p className="text-gray-600 mt-2">Historical performance trends aggregated from reviews and goals</p>
      </div>

      {!isLoading && !loadError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Periods</p>
            <p className="text-2xl font-bold text-gray-900">{overall.periods}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Avg. Rating</p>
            <p className="text-2xl font-bold text-blue-600">{overall.avg > 0 ? overall.avg.toFixed(1) : '—'}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Reviews Scored</p>
            <p className="text-2xl font-bold text-green-600">{overall.totalReviews}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Goals Tracked</p>
            <p className="text-2xl font-bold text-purple-600">{overall.totalGoals}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading trends…
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 py-12 justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{loadError}</span>
          </div>
        ) : trend.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <BarChart3 className="w-10 h-10 mb-2 text-gray-300" />
            <p>No review or goal data available to build trends yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {trend.map((t) => (
              <div key={t.period}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{t.period}</span>
                  <span className="text-xs text-gray-500">
                    {t.reviewCount} review{t.reviewCount !== 1 ? 's' : ''} · {t.goalCount} goal{t.goalCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-24">Avg. Rating</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(t.avgRating / maxRating) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                      {t.avgRating > 0 ? t.avgRating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-24">Goal Progress</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${Math.min(100, t.avgGoalProgress)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{t.avgGoalProgress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
