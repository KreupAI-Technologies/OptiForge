'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Download,
    UserPlus,
    Search,
    Filter,
    ChevronRight,
    TrendingUp,
    Users,
    DollarSign,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { fetchDomainList } from '@/services/reports-data.service';

export default function CustomerAcquisitionDetail() {
    const router = useRouter();

    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('crm/customers');
                const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r.id ?? '',
                    name: r.customerName ?? '',
                    since: r.createdAt ? String(r.createdAt).slice(0, 10) : (r.acquisitionDate ?? ''),
                    source: r.customerGroup ?? r.segment ?? r.customerLifecycleStage ?? 'Direct',
                    status: r.accountStatus ?? r.status ?? 'Active',
                    revenue: Number(r.lifetimeValue ?? 0),
                }));
                if (!cancelled) setCustomers(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setCustomers([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-orange-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <UserPlus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-none">Customer Acquisition</h1>
                                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mt-1">
                                    Detailed history of newly acquired business
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest border-gray-200">
                            <Download className="mr-2 h-4 w-4" /> Export Leads
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md font-black uppercase text-[10px] tracking-widest">
                            Add Participant
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Visual Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl border-none">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Total New Revenue</p>
                            <p className="text-4xl font-black italic tracking-tighter mt-1">$5.24M</p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-100">
                                <TrendingUp className="w-4 h-4" />
                                <span>14.5% Growth Month-over-Month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-gray-100">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Source</p>
                                <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">Referrals</p>
                                <p className="text-xs font-bold text-green-600 mt-1">+35% conversion</p>
                            </div>
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-gray-100">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Met</p>
                                <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">92.4%</p>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                                    <div className="bg-orange-600 h-full w-[92%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Data Table */}
                <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-900">Recent Conversions</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    className="pl-8 pr-4 py-1.5 border border-gray-100 rounded-lg text-[10px] focus:ring-1 focus:ring-orange-500 w-48"
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="font-black uppercase text-[9px] tracking-widest text-gray-500">
                            <Filter className="w-3 h-3 mr-2" /> More Filters
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Identity</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Acquisition Source</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Conversion Date</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Contract Value</th>
                                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map((cust) => (
                                        <tr
                                            key={cust.id}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/crm/customers/view/${cust.id}`)}
                                        >
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{cust.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{cust.id}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] border-none font-bold uppercase">{cust.source}</Badge>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-bold text-gray-500">{cust.since}</td>
                                            <td className="px-3 py-2">
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">${cust.revenue.toLocaleString()}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-center">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${cust.status === 'Active'
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : 'bg-orange-50 text-orange-700 border-orange-100'
                                                        }`}>
                                                        {cust.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-100 rounded-lg transition-all translate-x-4 group-hover:translate-x-0">
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

                {/* Footer Analysis */}
                <div className="flex gap-3 overflow-x-auto pb-4">
                    <div className="min-w-[300px] flex-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Demographic Split</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500">APAC Market</span>
                                <span className="font-black text-orange-600">42%</span>
                            </div>
                            <div className="w-full bg-gray-50 h-1 rounded-full">
                                <div className="bg-orange-600 h-full w-[42%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-[300px] flex-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-orange-600" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Vertical Density</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500">Manufacturing</span>
                                <span className="font-black text-blue-600">68%</span>
                            </div>
                            <div className="w-full bg-gray-50 h-1 rounded-full">
                                <div className="bg-blue-600 h-full w-[68%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
