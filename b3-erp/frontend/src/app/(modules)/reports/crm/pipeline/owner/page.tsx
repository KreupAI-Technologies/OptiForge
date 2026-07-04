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
    User,
    Briefcase,
    BarChart3,
    Trophy,
    PieChart
} from 'lucide-react';
import { fetchDomainList } from '@/services/reports-data.service';

function PipelineByOwnerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const owner = searchParams.get('owner') || 'All Sales Reps';

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
                    owner: r.assignedTo ?? r.teamAssignment ?? 'Unassigned',
                    stage: r.status ?? '',
                    value: Number(r.estimatedValue ?? 0),
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

    const filteredOpps = owner === 'All Sales Reps' || owner === 'All' ? opportunities : opportunities.filter(o => o.owner === owner);

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
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-none">Representative Ledger: {owner}</h1>
                                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                    Analyze individual portfolio value and conversion efficiency
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            Switch Rep
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md font-black uppercase text-[10px] tracking-widest">
                            <Download className="mr-2 h-4 w-4" /> Performance Data
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && <div className="rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
                {loadError && !isLoading && <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
                {/* Visual Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Card className="bg-white border-gray-100 shadow-sm border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pipeline Responsibility</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">
                                ${(filteredOpps.reduce((sum, o) => sum + o.value, 0) / 1000).toFixed(0)}K
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase">
                                <Trophy className="w-3 h-3" />
                                <span>Top 10% of org</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-100 shadow-sm border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Units Managed</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{filteredOpps.length}</p>
                            <p className="mt-3 text-[10px] font-bold text-orange-600 uppercase tracking-wider">Active Opportunities</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Ticket Size</p>
                            <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">
                                ${filteredOpps.length ? Math.round(filteredOpps.reduce((sum, o) => sum + o.value, 0) / filteredOpps.length / 1000) : 0}K
                            </p>
                            <p className="mt-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider">Medium Complexity</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 text-white shadow-xl border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/20 rounded">
                                    <BarChart3 className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Closing Index</p>
                            </div>
                            <p className="text-3xl font-black italic tracking-tighter mt-1">Excellent</p>
                            <p className="mt-3 text-[9px] font-black text-green-500 uppercase">Beating org benchmarks</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pipeline List Table */}
                <Card className="border-gray-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Assigned Opportunity Portfolio</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search portfolio..."
                                    className="pl-8 pr-4 py-1.5 border border-gray-100 rounded-lg text-[10px] focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="font-black uppercase text-[9px] tracking-widest text-gray-500">
                            Detail Analysis
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Project / Account</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned Owner</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Pipeline Stage</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Opportune Value</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOpps.map((opp) => (
                                        <tr
                                            key={opp.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/crm/opportunities/view/${opp.id}`)}
                                        >
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{opp.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{opp.account}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600">
                                                        {opp.owner.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{opp.owner}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${opp.stage === 'Closed Won'
                                                        ? 'bg-green-50 text-green-700 border-green-100'
                                                        : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {opp.stage}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">${opp.value.toLocaleString()}</p>
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

export default function PipelineByOwnerDetail() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-black uppercase tracking-widest">Aggregating Team Portfolios...</div>}>
            <LeadsByOwnerContent />
        </Suspense>
    );
}

// Small fix for the component name in the Suspense wrapper
function LeadsByOwnerContent() {
    return <PipelineByOwnerContent />;
}
