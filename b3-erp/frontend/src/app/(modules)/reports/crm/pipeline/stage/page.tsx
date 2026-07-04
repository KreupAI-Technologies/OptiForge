'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Download,
    Search,
    Filter,
    ChevronRight,
    Layers,
    Target,
    TrendingUp,
    CircleDollarSign,
    Briefcase
} from 'lucide-react';
import { fetchDomainList } from '@/services/reports-data.service';

function PipelineByStageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stage = searchParams.get('stage') || 'All Stages';

    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('crm/leads');
                const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r.id ?? '',
                    name: r.title ?? [r.firstName, r.lastName].filter(Boolean).join(' ') || r.company || '',
                    account: r.company ?? '',
                    stage: r.status ?? '',
                    value: Number(r.estimatedValue ?? 0),
                    probability: Number(r.probability ?? 0),
                    closeDate: r.estimatedCloseDate ? String(r.estimatedCloseDate).slice(0, 10) : '',
                }));
                if (!cancelled) setOpportunities(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setOpportunities([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredOpps = stage === 'All Stages' || stage === 'All' ? opportunities : opportunities.filter(o => o.stage === stage);

    const getProbabilityColor = (prob: number) => {
        if (prob >= 80) return 'text-green-600';
        if (prob >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-orange-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-none">Pipeline Context: {stage}</h1>
                                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                    Opportunity flow and conversion probability analysis
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            Filter Stage
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md font-black uppercase text-[10px] tracking-widest">
                            <Download className="mr-2 h-4 w-4" /> Export Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && <div className="rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
                {loadError && !isLoading && <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
                {/* Visual Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-none shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Unweighted</p>
                                    <p className="text-4xl font-black italic tracking-tighter mt-1">
                                        ${(filteredOpps.reduce((sum, o) => sum + o.value, 0) / 1000000).toFixed(2)}M
                                    </p>
                                </div>
                                <CircleDollarSign className="w-10 h-10 text-indigo-700/50" />
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-400">
                                <TrendingUp className="w-4 h-4" />
                                <span>Highest value in Q1 history</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-100 shadow-sm flex items-center justify-between p-3">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wtd. Average Prob.</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">
                                {(() => { const tot = filteredOpps.reduce((sum, o) => sum + o.value, 0); return tot ? Math.round(filteredOpps.reduce((sum, o) => sum + (o.value * o.probability), 0) / tot) : 0; })()}%
                            </p>
                            <p className="text-xs font-bold text-orange-600 mt-1 uppercase">High confidence sector</p>
                        </div>
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                            <Target className="w-8 h-8 text-orange-600" />
                        </div>
                    </Card>

                    <Card className="bg-white border-gray-100 shadow-sm flex items-center justify-between p-3">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opportunity Count</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{filteredOpps.length}</p>
                            <p className="text-xs font-bold text-blue-600 mt-1 uppercase">Active Negotiations</p>
                        </div>
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-blue-600" />
                        </div>
                    </Card>
                </div>

                {/* Main Opportunities Table */}
                <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Stage Pipeline Inventory</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search opportunities..."
                                    className="pl-8 pr-4 py-1.5 border border-gray-100 rounded-lg text-[10px] focus:ring-1 focus:ring-orange-500 w-48"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Opportunity Subject</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Associated Account</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Commit Prob.</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Target Close</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Unweighted Value</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredOpps.map((opp) => (
                                        <tr
                                            key={opp.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/crm/opportunities/view/${opp.id}`)}
                                        >
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{opp.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{opp.id}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant="outline" className="border-gray-100 text-[10px] font-bold py-0">{opp.account}</Badge>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-sm font-black italic ${getProbabilityColor(opp.probability)}`}>{opp.probability}%</span>
                                                    <div className="w-16 bg-gray-100 h-1 rounded-full mt-1">
                                                        <div className={`h-full rounded-full ${opp.probability >= 80 ? 'bg-green-500' :
                                                                opp.probability >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                                            }`} style={{ width: `${opp.probability}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-bold text-gray-500">{opp.closeDate}</td>
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">${opp.value.toLocaleString()}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Weighted: ${(opp.value * (opp.probability / 100)).toLocaleString()}</p>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-100 rounded-lg transition-all translate-x-2 group-hover:translate-x-0">
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PipelineByStageDetail() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-black uppercase tracking-widest">Slicing Pipeline Stages...</div>}>
            <PipelineByStageContent />
        </Suspense>
    );
}
