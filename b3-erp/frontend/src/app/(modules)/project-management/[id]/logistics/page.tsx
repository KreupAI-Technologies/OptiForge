'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Truck,
    User,
    Phone,
    Camera,
    CheckCircle2,
    MapPin,
    Clock,
    ArrowRight,
    Search,
    Navigation,
    ShieldCheck
} from 'lucide-react';

interface CrateRow {
    id: string;
    desc: string;
    weight: string;
}

export default function DispatchControlPage() {
    const { id: projectId } = useParams() as { id: string };
    const [status, setStatus] = useState<'LOADING' | 'IN_TRANSIT' | 'DELIVERED'>('LOADING');
    const [crates, setCrates] = useState<CrateRow[]>([]);
    const [siteReady, setSiteReady] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rows = await projectManagementService.listCrates();
                if (cancelled) return;
                const projectCrates = (Array.isArray(rows) ? rows : [])
                    .filter((c: any) => !c.projectId || c.projectId === projectId)
                    .map((c: any) => ({
                        id: c.crateNumber ?? c.crateCode ?? c.id ?? '',
                        desc: c.description ?? c.contents ?? c.name ?? 'Crate',
                        weight: c.weight != null ? `${c.weight} KG` : (c.grossWeight != null ? `${c.grossWeight} KG` : '-'),
                    }));
                setCrates(projectCrates);
            } catch { if (!cancelled) setCrates([]); }
            try {
                const readiness = await projectManagementService.getInstallationReadiness(projectId);
                if (!cancelled) {
                    const r: any = readiness;
                    if (!r) { setSiteReady(null); }
                    else if (r.ready != null) { setSiteReady(Boolean(r.ready)); }
                    else if (r.isReady != null) { setSiteReady(Boolean(r.isReady)); }
                    else if (r.status != null) { setSiteReady(r.status === 'Ready'); }
                    else { setSiteReady(null); }
                }
            } catch { if (!cancelled) setSiteReady(null); }
        })();
        return () => { cancelled = true; };
    }, [projectId]);

    return (
        <div className="w-full space-y-4 px-3 py-2">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Navigation className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none italic uppercase tracking-tighter">Dispatch Control</h1>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 7.1-7.6 | loading & Transit Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${status === 'IN_TRANSIT' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                        {status}
                    </span>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-b-2 border-slate-950">Update Transit</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logistics Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Loading bay Verification</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-gray-100">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Vehicle No</div>
                                        <div className="text-xs font-black text-slate-900">DXB-77421</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-gray-100">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Driver Name</div>
                                        <div className="text-xs font-black text-slate-900">Satoshi Nakamoto</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl flex flex-col justify-center items-center gap-3 border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-all group">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors shadow-sm">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Loading Proof</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crate Checklist</h3>
                            {crates.length === 0 && (
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 text-center">No crates for this project</div>
                            )}
                            {crates.map((crate) => (
                                <div key={crate.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-slate-50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-[10px]">{(crate.id.split('-')[1] ?? crate.id).slice(0, 3)}</div>
                                        <div>
                                            <div className="text-xs font-black text-slate-900">{crate.desc}</div>
                                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{crate.id} • {crate.weight}</div>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tracking & Timeline */}
                <div className="space-y-4">
                    <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 relative overflow-hidden">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transit Tracker</div>
                        <div className="space-y-8 relative">
                            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800"></div>
                            <div className="flex gap-6 relative">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10"><CheckCircle2 className="w-4 h-4" /></div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-emerald-400 uppercase">Loaded</div>
                                    <div className="text-xs font-black italic">Feb 06, 09:30 AM</div>
                                </div>
                            </div>
                            <div className="flex gap-6 relative">
                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 z-10"><Clock className="w-4 h-4 border-2 border-white rounded-full" /></div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-amber-400 uppercase">In Transit</div>
                                    <div className="text-xs font-black italic">En-route to Abu Dhabi Site</div>
                                </div>
                            </div>
                            <div className="flex gap-6 relative opacity-30">
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center z-10"><MapPin className="w-4 h-4" /></div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase">Delivered</div>
                                    <div className="text-xs font-black italic">Awaiting ETA</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 p-8 opacity-5">
                            <Truck className="w-32 h-32" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Readiness</h4>
                                <p className="text-xs font-black text-slate-900 italic uppercase tracking-tighter">
                                    {siteReady === true ? 'Verified & Ready' : siteReady === false ? 'Not Ready' : 'Pending Check'}
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                            {siteReady === true
                                ? 'Site Readiness Portal confirmed all mandatory checks (Phase 7.7) are complete. Dispatch unlocked.'
                                : 'Awaiting Site Readiness Portal confirmation of mandatory checks (Phase 7.7).'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
