'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Download,
    TrendingUp,
    User,
    BarChart3,
    ArrowUpRight,
    DollarSign,
    Briefcase,
    Target,
    Filter,
    Layers
} from 'lucide-react';
import { fetchReportDataset } from '@/services/reports-management.service';

interface PipelineData {
    totalPipeline: number;
    openDeals: number;
    avgDealSize: number;
    winRate: number;
    weightedValue: number;
    pipelineVelocity: number;
}

const DEFAULT_DATA: PipelineData = {
    totalPipeline: 2500000,
    openDeals: 45,
    avgDealSize: 55000,
    winRate: 32,
    weightedValue: 1850000,
    pipelineVelocity: 18.2
};

export default function PipelineAnalysisReport() {
    const router = useRouter();
    const [data, setData] = useState<PipelineData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<PipelineData>>('crm.pipeline');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalPipeline: Number(payload.totalPipeline ?? DEFAULT_DATA.totalPipeline),
                        openDeals: Number(payload.openDeals ?? DEFAULT_DATA.openDeals),
                        avgDealSize: Number(payload.avgDealSize ?? DEFAULT_DATA.avgDealSize),
                        winRate: Number(payload.winRate ?? DEFAULT_DATA.winRate),
                        weightedValue: Number(payload.weightedValue ?? DEFAULT_DATA.weightedValue),
                        pipelineVelocity: Number(payload.pipelineVelocity ?? DEFAULT_DATA.pipelineVelocity),
                    });
                }
            } catch (e) {
                if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load report');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-none">Pipeline Analysis</h1>
                            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                Comprehensive forecast and sales funnel velocity mapping
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            <Filter className="mr-2 h-4 w-4" /> Config Forecast
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md font-black uppercase text-[10px] tracking-widest">
                            <Download className="mr-2 h-4 w-4" /> Export Pipeline
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
                {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}
                {/* Visual KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/pipeline/stage')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pipeline</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">${(data.totalPipeline / 1000000).toFixed(2)}M</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross unweighted value</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-orange-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/pipeline/stage')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Deals</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.openDeals}</p>
                                </div>
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 font-mono">
                                <span>+5 new this week</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-l-4 border-l-green-500 hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Win Rate</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.winRate}%</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Target className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                <span>Industry Avg: 28%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-l-4 border-l-purple-500 hover:-translate-y-1">
                        <CardContent className="p-6 text-white bg-gray-900 border-none rounded-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weighted Value</p>
                                    <p className="text-3xl font-black text-white mt-1 italic tracking-tighter">${(data.weightedValue / 1000000).toFixed(2)}M</p>
                                </div>
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-orange-500" />
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-black text-orange-400 uppercase tracking-wider">Forecast Confidence: High</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Funnel & Distribution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="overflow-hidden border-gray-100 shadow-sm">
                        <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Pipeline by Stage</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/reports/crm/pipeline/stage')}>
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className="h-72 bg-gradient-to-br from-blue-50/50 to-white rounded-xl border border-blue-50 flex items-center justify-center cursor-pointer group"
                                onClick={() => router.push('/reports/crm/pipeline/stage')}
                            >
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <Layers className="w-16 h-16 text-blue-500 mb-2" />
                                    <p className="text-blue-900 font-bold">Funnel Visualization</p>
                                    <p className="text-xs text-blue-600 mt-1">Detailed conversion metrics by stage</p>
                                </div>
                            </div>
                            <div className="mt-8 space-y-2">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                        <span className="text-gray-400">Negotiation</span>
                                        <span className="text-gray-900">$840K (33%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                        <div className="bg-blue-600 h-full w-[33%] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                        <span className="text-gray-400">Proposal</span>
                                        <span className="text-gray-900">$1.1M (45%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                        <div className="bg-orange-500 h-full w-[45%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-gray-100 shadow-sm">
                        <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Sales Force Distribution</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/reports/crm/pipeline/owner')}>
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className="h-72 bg-gradient-to-br from-green-50/50 to-white rounded-xl border border-green-50 flex items-center justify-center cursor-pointer group"
                                onClick={() => router.push('/reports/crm/pipeline/owner')}
                            >
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <User className="w-16 h-16 text-green-500 mb-2" />
                                    <p className="text-green-900 font-bold">Team Performance</p>
                                    <p className="text-xs text-green-600 mt-1">Inventory of deals per representative</p>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Top Performer</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">Eleanor Shellstrop</p>
                                    <p className="text-[10px] font-black text-green-600">$450K in Pipeline</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Velocity King</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">Chidi Anagonye</p>
                                    <p className="text-[10px] font-black text-blue-600">12 Days Avg Cycle</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Velocity Insights Panel */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-3 text-white flex items-center gap-8 shadow-xl">
                    <div className="p-4 bg-gray-800 rounded-2xl">
                        <TrendingUp className="w-10 h-10 text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">Funnel Acceleration</h4>
                        <p className="text-xl font-black italic tracking-tighter">Your pipeline velocity improved by {data.pipelineVelocity}% since Q3</p>
                        <p className="text-gray-400 text-xs mt-1 max-w-2xl font-medium">
                            Average deal closing time has decreased from 45 to 38 days. Focus on moving deals from 'Proposal' to 'Negotiation' to maintain this momentum.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

