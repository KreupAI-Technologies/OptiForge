'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Download,
    UserPlus,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Target,
    BarChart3,
    Calendar,
    AlertTriangle,
    DollarSign
} from 'lucide-react';
import { fetchReportDataset } from '@/services/reports-management.service';

interface CustomerGrowthData {
    totalCustomers: number;
    newCustomers: number;
    churnRate: number;
    ltv: number;
    retentionRate: number;
    growthRate: number;
}

const DEFAULT_DATA: CustomerGrowthData = {
    totalCustomers: 1250,
    newCustomers: 45,
    churnRate: 2.5,
    ltv: 15000,
    retentionRate: 97.5,
    growthRate: 12.4
};

export default function CustomerGrowthReport() {
    const router = useRouter();
    const [data, setData] = useState<CustomerGrowthData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<CustomerGrowthData>>('crm.customers');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalCustomers: Number(payload.totalCustomers ?? DEFAULT_DATA.totalCustomers),
                        newCustomers: Number(payload.newCustomers ?? DEFAULT_DATA.newCustomers),
                        churnRate: Number(payload.churnRate ?? DEFAULT_DATA.churnRate),
                        ltv: Number(payload.ltv ?? DEFAULT_DATA.ltv),
                        retentionRate: Number(payload.retentionRate ?? DEFAULT_DATA.retentionRate),
                        growthRate: Number(payload.growthRate ?? DEFAULT_DATA.growthRate),
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
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-none">Customer Growth</h1>
                            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                Track acquisition, retention, and lifetime value
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            <Calendar className="mr-2 h-4 w-4" /> This Year
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/customers/acquisition')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Customers</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.totalCustomers.toLocaleString()}</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>+8.2% from last year</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-500 hover:-translate-y-1"
                        onClick={() => router.push('/reports/crm/customers/acquisition')}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Acquisition</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.newCustomers}</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <UserPlus className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase">This current month</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-l-4 border-l-red-500 hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Churn Rate</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{data.churnRate}%</p>
                                </div>
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Higher than industry avg</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-all border-l-4 border-l-purple-500 hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg LTV</p>
                                    <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">${(data.ltv / 1000).toFixed(1)}K</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>+$1.2K per customer</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sub-Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Acquisition Trends</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/reports/crm/customers/acquisition')}>
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className="h-64 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 flex items-center justify-center cursor-pointer group"
                                onClick={() => router.push('/reports/crm/customers/acquisition')}
                            >
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-12 h-12 text-blue-500 mb-3" />
                                    <p className="text-blue-900 font-bold">Analysis Pending</p>
                                    <p className="text-xs text-blue-600 mt-1">Click to view deep-dive acquisition metrics</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Organic Growth</span>
                                    <span className="font-bold text-gray-900">65%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[65%]"></div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Paid Acquisition</span>
                                    <span className="font-bold text-gray-900">35%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full w-[35%]"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Customer Segments</CardTitle>
                            <Button variant="ghost" size="sm">
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-64 bg-gradient-to-b from-purple-50 to-white rounded-xl border border-purple-100 flex items-center justify-center">
                                <div className="text-center">
                                    <Target className="w-12 h-12 text-purple-500 mb-3" />
                                    <p className="text-purple-900 font-bold">Market Segmentation</p>
                                    <p className="text-xs text-purple-600 mt-1">Interactive heatmap available in full report</p>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Enterprise</p>
                                    <p className="text-xl font-black text-gray-900 italic tracking-tighter">42%</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Mid-Market</p>
                                    <p className="text-xl font-black text-gray-900 italic tracking-tighter">38%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Growth Summary Panel */}
                <div className="bg-gray-900 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">Growth Forecast</h4>
                        <p className="text-2xl font-black italic tracking-tighter">Sustained expansion at {data.growthRate}% annually</p>
                        <p className="text-gray-400 text-sm mt-2 max-w-lg">
                            Based on current acquisition rates and improved LTV, revenue from current customer base is expected to double in 3.5 years.
                        </p>
                        <Button className="mt-6 bg-white text-gray-900 hover:bg-gray-100 font-black uppercase text-[10px] tracking-widest">
                            View Strategy Panel
                        </Button>
                    </div>
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none"></div>
                    <TrendingUp className="w-32 h-32 text-white/5 absolute -right-4 -bottom-4" />
                </div>
            </div>
        </div>
    );
}
