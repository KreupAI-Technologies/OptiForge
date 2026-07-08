'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, ScanText, Wifi, ArrowRight, Activity, Cpu, FileText, Loader2, AlertCircle } from 'lucide-react';
import { dashboardOverviewService, type DashboardOverviewMetrics } from '@/services/dashboard-overview.service';
import { advancedFeaturesService, type AiInsightStats, type OcrStats } from '@/services/advanced-features.service';

export default function AdvancedFeaturesPage() {
    const [metrics, setMetrics] = useState<DashboardOverviewMetrics | null>(null);
    const [insightStats, setInsightStats] = useState<AiInsightStats | null>(null);
    const [ocrStats, setOcrStats] = useState<OcrStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [overview, insights, ocr] = await Promise.all([
                    dashboardOverviewService.getOverview(),
                    advancedFeaturesService.insightStats(),
                    advancedFeaturesService.ocrStats(),
                ]);
                if (cancelled) return;
                setMetrics(overview.metrics);
                setInsightStats(insights);
                setOcrStats(ocr);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load summary');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const features = [
        {
            title: 'AI Insights',
            description: 'Predictive analytics and intelligent forecasting for your business operations.',
            icon: Brain,
            color: 'bg-purple-100 text-purple-600',
            href: '/advanced-features/ai-insights',
            stats: insightStats ? `${insightStats.total} Insights` : 'AI Insights',
        },
        {
            title: 'OCR Integration',
            description: 'Automated document processing and data extraction from invoices and receipts.',
            icon: ScanText,
            color: 'bg-blue-100 text-blue-600',
            href: '/advanced-features/ocr',
            stats: ocrStats ? `${ocrStats.total} Docs Processed` : 'OCR',
        },
        {
            title: 'IoT Dashboard',
            description: 'Real-time monitoring and control of connected manufacturing equipment.',
            icon: Wifi,
            color: 'bg-green-100 text-green-600',
            href: '/advanced-features/iot',
            stats: '42 Active Devices',
        },
    ];

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Advanced Features</h1>
                <p className="text-gray-600 mt-2">Next-generation capabilities for your manufacturing operations</p>
            </div>

            {/* Live cross-module summary */}
            {loading ? (
                <div className="mb-8 flex items-center gap-2 text-gray-500 bg-white border border-gray-200 rounded-xl p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading live summary…</span>
                </div>
            ) : error ? (
                <div className="mb-8 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            ) : (
                <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'AI Insights', value: insightStats?.total ?? 0 },
                        { label: 'OCR Documents', value: ocrStats?.total ?? 0 },
                        { label: 'Docs Completed', value: ocrStats?.completed ?? 0 },
                        { label: 'Inventory Items', value: metrics?.inventoryItems ?? 0 },
                    ].map((kpi) => (
                        <div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                            <p className="text-sm text-gray-600 mt-1">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {features.map((feature) => (
                    <Link
                        key={feature.title}
                        href={feature.href}
                        className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className={`p-3 rounded-lg ${feature.color}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                            {feature.description}
                        </p>

                        <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                            <Activity className="w-4 h-4 mr-2" />
                            {feature.stats}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Stats / Overview Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center gap-3 mb-3">
                        <Cpu className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-gray-900">System Utilization</h2>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">AI Processing Units</span>
                                <span className="font-medium text-gray-900">45%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">OCR Queue Capacity</span>
                                <span className="font-medium text-gray-900">12%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">IoT Bandwidth</span>
                                <span className="font-medium text-gray-900">78%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Feature Breakdown</h2>
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-500 py-6">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-red-700 py-6">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                                <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-900">
                                        {insightStats?.total ?? 0} AI insights across {Object.keys(insightStats?.byCategory ?? {}).length} categories
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Avg confidence {Math.round((insightStats?.avgConfidence ?? 0) * 100)}%
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-900">
                                        {ocrStats?.completed ?? 0} of {ocrStats?.total ?? 0} OCR documents completed
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {ocrStats?.processing ?? 0} processing · {ocrStats?.queued ?? 0} queued · {ocrStats?.failed ?? 0} failed
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 last:pb-0">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                                <div>
                                    <p className="text-sm text-gray-900">
                                        {metrics?.production ?? 0} production work centers · {metrics?.inventoryItems ?? 0} inventory items
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">From cross-module overview</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
