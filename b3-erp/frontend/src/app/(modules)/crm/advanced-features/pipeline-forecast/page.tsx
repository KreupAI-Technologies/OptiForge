'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PipelineForecast } from '@/components/crm';
import type { ForecastPeriod, ForecastScenario } from '@/components/crm/PipelineForecast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import crmService from '@/services/crm.service';

interface PipelineForecastAnalytics {
  totalPipeline?: number;
  weightedPipeline?: number;
  openCount?: number;
  wonCount?: number;
  wonValue?: number;
  byStage?: Array<{ stage: string; count: number; value: number; weighted: number }>;
  byMonth?: Array<{ month: string; count: number; value: number; weighted: number }>;
  byConfidence?: Array<{ band: string; count: number; value: number }>;
}

export default function PipelineForecastPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<PipelineForecastAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await crmService.analyticsViews.getPipelineForecast();
        if (!cancelled) {
          setAnalytics(result ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setAnalytics(null);
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load pipeline forecast.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const byMonth = analytics?.byMonth ?? [];
  const byStage = analytics?.byStage ?? [];
  const byConfidence = analytics?.byConfidence ?? [];
  const totalPipeline = analytics?.totalPipeline ?? 0;
  const weightedPipeline = analytics?.weightedPipeline ?? 0;

  // Map the aggregated monthly rollup into the component's ForecastPeriod shape.
  const periods: ForecastPeriod[] = byMonth.map((m) => ({
    month: m.month ?? '',
    committed: m.weighted ?? 0,
    bestCase: Math.round(((m.weighted ?? 0) + (m.value ?? 0)) / 2),
    pipeline: m.value ?? 0,
    closed: 0,
    target: m.value ?? 0,
    opportunities: m.count ?? 0,
  }));

  // Derive scenarios from confidence bands / totals (cosmetic labels kept static).
  const bandValue = (predicate: (band: string) => boolean) =>
    byConfidence
      .filter((c) => predicate((c.band ?? '').toLowerCase()))
      .reduce((sum, c) => sum + (c.value ?? 0), 0);

  const highBand = bandValue((b) => b.includes('high'));
  const scenarios: ForecastScenario[] = [
    {
      name: 'Conservative',
      probability: 90,
      revenue: weightedPipeline,
      description: 'Weighted pipeline based on stage probability',
    },
    {
      name: 'Likely',
      probability: 70,
      revenue: highBand > 0 ? weightedPipeline + highBand : Math.round((weightedPipeline + totalPipeline) / 2),
      description: 'Weighted pipeline plus high-confidence upside',
    },
    {
      name: 'Optimistic',
      probability: 40,
      revenue: totalPipeline,
      description: 'All open pipeline deals close',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-1 px-3 py-2 overflow-auto">
        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading forecast…
          </div>
        )}
        {loadError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <button
          onClick={() => router.push('/crm/advanced-features')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Advanced Features
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">AI Pipeline Forecasting</h2>
          <p className="text-gray-600 mb-2">
            Advanced revenue predictions with confidence intervals, risk assessment, and scenario analysis
            powered by machine learning.
          </p>
          <PipelineForecast
            periods={periods}
            scenarios={scenarios}
            currentPeriodIndex={0}
            showAIPredictions={true}
            showScenarios={true}
          />
        </div>
      </div>
    </div>
  );
}
