'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Download,
    PieChart,
    Users,
    TrendingUp,
    ArrowUpRight,
    BarChart3,
    Zap,
    Target,
    Filter,
    Calendar
} from 'lucide-react';
import { fetchReportDataset } from '@/services/reports-management.service';

interface LeadAnalysisData {
    totalLeads: number;
    newLeads: number;
    qualifiedCount: number;
    conversionRate: number;
    activeCampaigns: number;
    costPerLead: number;
}

const DEFAULT_DATA: LeadAnalysisData = {
    totalLeads: 450,
    newLeads: 45,
    qualifiedCount: 120,
    conversionRate: 15,
    activeCampaigns: 12,
    costPerLead: 24.50
};

export default function LeadAnalysisReport() {
    const router = useRouter();
    const [data, setData] = useState<LeadAnalysisData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<LeadAnalysisData>>('crm.leads');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalLeads: Number(payload.totalLeads ?? DEFAULT_DATA.totalLeads),
                        newLeads: Number(payload.newLeads ?? DEFAULT_DATA.newLeads),
                        qualifiedCount: Number(payload.qualifiedCount ?? DEFAULT_DATA.qualifiedCount),
                        conversionRate: Number(payload.conversionRate ?? DEFAULT_DATA.conversionRate),
                        activeCampaigns: Number(payload.activeCampaigns ?? DEFAULT_DATA.activeCampaigns),
                        costPerLead: Number(payload.costPerLead ?? DEFAULT_DATA.costPerLead),
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-none">Lead Analysis</h1>
                            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                Track lead generation, conversion, and funnel velocity
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            <Filter className="mr-2 h-4 w-4" /> Filter Channels
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md font-black uppercase text-[10px] tracking-widest">
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
                {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/leads/status?status=All')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Leads</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.totalLeads.toLocaleString()}</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 font-mono">
                                <span>+12% vs last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/leads/status?status=New')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New / Current</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.newLeads}</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Zap className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Unprocessed</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-purple-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/leads/status?status=Qualified')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SQL (Qualified)</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.qualifiedCount}</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Target className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>26.7% qualification rate</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-l-4 border-l-orange-500 hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conv. Rate</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.conversionRate}%</p>
                                </div>
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-black text-orange-600 uppercase">Benchmark Met</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytical Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="overflow-hidden border-gray-100 shadow-sm">
                        <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Source Attribution</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/reports/crm/leads/source')}>
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className="h-64 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 flex items-center justify-center cursor-pointer group"
                                onClick={() => router.push('/reports/crm/leads/source')}
                            >
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <PieChart className="w-12 h-12 text-blue-500 mb-3" />
                                    <p className="text-blue-900 font-bold">Source Analysis Pending</p>
                                    <p className="text-xs text-blue-600 mt-1">Click to view multi-channel attribution</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                        <span className="text-xs font-bold text-gray-500">LinkedIn Ads</span>
                                    </div>
                                    <span className="text-xs font-black">42%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                                        <span className="text-xs font-bold text-gray-500">Organic Search</span>
                                    </div>
                                    <span className="text-xs font-black">28%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                        <span className="text-xs font-bold text-gray-500">Referrals</span>
                                    </div>
                                    <span className="text-xs font-black">15%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-gray-100 shadow-sm">
                        <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Status Throughput</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/reports/crm/leads/status?status=All')}>
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-64 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 flex items-center justify-center">
                                <div className="text-center">
                                    <Users className="w-12 h-12 text-purple-500 mb-3" />
                                    <p className="text-purple-900 font-bold">Pipeline Health</p>
                                    <p className="text-xs text-purple-600 mt-1">Status distribution heatmap</p>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">New</p>
                                    <p className="text-sm font-black text-gray-900">12%</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Contacted</p>
                                    <p className="text-sm font-black text-gray-900">38%</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Qualified</p>
                                    <p className="text-sm font-black text-gray-900">26%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights Panel */}
                <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex items-start gap-3 relative overflow-hidden">
                    <div className="w-1.5 bg-orange-600 absolute left-0 top-0 bottom-0"></div>
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" /> Operational Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm font-bold text-gray-700">Highest ROI Source</p>
                                <p className="text-xs text-gray-500 mt-1">LinkedIn Ads currently provide the lowest cost-per-lead at <span className="text-orange-600 font-black italic">$18.40</span>, which is 24% below average.</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-700">Conversion Bottle-neck</p>
                                <p className="text-xs text-gray-500 mt-1">Average time in 'Contacted' status has increased to <span className="text-red-600 font-black italic">4.2 days</span>. Action recommended for Sales Ops.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

