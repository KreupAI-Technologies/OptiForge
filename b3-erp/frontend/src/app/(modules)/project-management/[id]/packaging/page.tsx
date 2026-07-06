'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Package,
    Weight,
    QrCode,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Boxes,
    Search,
    Printer,
    Scaling
} from 'lucide-react';

interface Crate {
    id: string;
    number: string;
    items: number;
    designWeight: number;
    actualWeight?: number;
    status: 'Open' | 'Sealed' | 'Mismatch';
}

export default function PackingDashboard() {
    const params = useParams() as { id?: string };
    const [crates, setCrates] = useState<Crate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listCrates();
                if (!active) return;
                if (rows && rows.length > 0) {
                    setCrates(rows.map((r) => ({
                        id: r.id,
                        number: r.number || '',
                        items: r.items ?? 0,
                        designWeight: r.designWeight ?? 0,
                        actualWeight: r.actualWeight,
                        status: (r.status as Crate['status']) || 'Open',
                    })));
                }
                setError(null);
            } catch (e) {
                if (active) setError('Failed to load crates');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [params?.id]);

    return (
        <div className="w-full space-y-4 px-3 py-2">
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg">{error}</div>
            )}
            {loading && (
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading crates…</div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none italic uppercase tracking-tighter">Packaging Control</h1>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 6.4-6.8 | modular Crating & Weight Check</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all border-b-2 border-slate-950 flex items-center gap-2">
                        <Boxes className="w-4 h-4" />
                        Add New Crate
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-all border border-gray-200">
                        <Printer className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Crate Visual Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {crates.map(crate => (
                    <div key={crate.id} className={`bg-white rounded-3xl border-2 transition-all p-6 space-y-6 ${crate.status === 'Mismatch' ? 'border-rose-200 shadow-lg shadow-rose-50' : 'border-gray-100 hover:border-indigo-100'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industrial Crate</div>
                                <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">{crate.number}</h3>
                            </div>
                            <div className={`p-2 rounded-xl ${crate.status === 'Sealed' ? 'bg-emerald-50 text-emerald-600' :
                                crate.status === 'Mismatch' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                                }`}>
                                <QrCode className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                            <div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Packed</div>
                                <div className="text-sm font-black text-slate-900">{crate.items} Units</div>
                            </div>
                            <div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                <div className={`text-[8px] font-black uppercase inline-block px-1.5 py-0.5 rounded ${crate.status === 'Sealed' ? 'bg-emerald-50 text-emerald-600' :
                                    crate.status === 'Mismatch' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                                    }`}>{crate.status}</div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-2xl space-y-3 ${crate.status === 'Mismatch' ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50'
                            }`}>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-500 flex items-center gap-1.5"><Weight className="w-3.5 h-3.5" /> Design Weight</span>
                                <span className="text-slate-900">{crate.designWeight} KG</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-500 flex items-center gap-1.5"><Scaling className="w-3.5 h-3.5" /> Actual Weight</span>
                                <span className={crate.status === 'Mismatch' ? 'text-rose-600 font-black underline animate-pulse' : 'text-slate-900'}>
                                    {crate.actualWeight ? `${crate.actualWeight} KG` : 'PENDING'}
                                </span>
                            </div>
                        </div>

                        {crate.status === 'Mismatch' && (
                            <div className="text-[8px] font-bold text-rose-500 italic leading-none">
                                Rule 6.8: Deviation {'>'} 5%. Verify contents against BOQ before sealing.
                            </div>
                        )}

                        <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                            Manage Contents
                        </button>
                    </div>
                ))}
                {!loading && crates.length === 0 && (
                    <div className="md:col-span-3 bg-white rounded-3xl border-2 border-gray-100 p-10 text-center text-xs font-bold text-slate-400">
                        No crates found.
                    </div>
                )}
            </div>

            {/* Packaging Progress Analytics */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Project Dispatch Readiness</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">74% of Items QC-Passed and Crating ongoing</p>
                    </div>
                    <div className="flex gap-12">
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Weight</div>
                            <div className="text-2xl font-black italic">1,420 <span className="text-xs">KG</span></div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Crates</div>
                            <div className="text-2xl font-black italic">12 <span className="text-xs">Units</span></div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Package className="w-32 h-32" />
                </div>
            </div>
        </div>
    );
}
