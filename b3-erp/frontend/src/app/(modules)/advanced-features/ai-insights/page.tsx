'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, Package, Brain, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import {
    advancedFeaturesService,
    type AiInsight,
    type AiInsightStats,
} from '@/services/advanced-features.service';

const SEVERITY_STYLES: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
    info: 'bg-gray-100 text-gray-700',
};

export default function AIInsightsPage() {
    const [insights, setInsights] = useState<AiInsight[]>([]);
    const [stats, setStats] = useState<AiInsightStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [list, s] = await Promise.all([
                    advancedFeaturesService.listInsights(),
                    advancedFeaturesService.insightStats(),
                ]);
                if (cancelled) return;
                setInsights(list.data);
                setStats(s);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load AI insights');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const highRisk = insights.filter((i) => i.severity === 'high' || i.severity === 'critical').length;
    const topCategory = stats && Object.keys(stats.byCategory).length > 0
        ? Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0][0]
        : '—';

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/advanced-features" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
                        <p className="text-gray-600 mt-1">Predictive analytics and intelligent forecasting</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Run New Analysis
                    </button>
                </div>
            </div>

            {/* Key Metrics (live) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Total Insights', value: loading ? '—' : String(stats?.total ?? 0), icon: Lightbulb, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Avg Confidence', value: loading ? '—' : `${Math.round((stats?.avgConfidence ?? 0) * 100)}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'High / Critical Risks', value: loading ? '—' : String(highRisk), icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                    { label: 'Top Category', value: loading ? '—' : topCategory, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 capitalize">{stat.value}</h3>
                        <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Insights list (live) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Generated Insights
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500 py-16">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading insights…</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-16">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                        <p className="text-red-700 font-medium">{error}</p>
                        <p className="text-sm text-gray-500 mt-1">Please try again later.</p>
                    </div>
                ) : insights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16">
                        <Lightbulb className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-900 font-medium">No insights yet</p>
                        <p className="text-sm text-gray-500 mt-1">Run a new analysis to generate insights.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {insights.map((item) => (
                            <div key={item.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-start mb-1 gap-3">
                                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.info}`}>
                                            {item.severity}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
                                            {Math.round((item.confidence ?? 0) * 100)}% conf.
                                        </span>
                                    </div>
                                </div>
                                {item.description && (
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                )}
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="capitalize">{item.category.replace(/-/g, ' ')}</span>
                                    {item.module && <span>· {item.module}</span>}
                                    <span>· {item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
