'use client';

import React, { useState, useEffect } from 'react';
import {
    Home,
    Camera,
    CheckCircle2,
    AlertCircle,
    Zap,
    Construction,
    ShieldCheck,
    ArrowLeft,
    Share2,
    Loader2
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ReadinessCheck {
    id: string;
    title: string;
    status: string;
    desc: string;
}

export default function SiteReadinessPortal() {
    const params = useParams();
    const id = String(params?.id ?? '');
    const projectId = id;

    const [checks, setChecks] = useState<ReadinessCheck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!projectId) { setIsLoading(false); return; }
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await projectManagementService.getInstallationReadiness(projectId);
                const mapped: ReadinessCheck[] = (raw || []).map((r: any, idx: number) => ({
                    id: String(r.id ?? r.checkId ?? idx + 1),
                    title: r.title ?? r.name ?? r.checkName ?? r.label ?? 'Untitled Check',
                    status: r.status ?? (r.ready ? 'Ready' : 'Not Ready'),
                    desc: r.desc ?? r.description ?? r.notes ?? '',
                }));
                if (!cancelled) setChecks(mapped);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setChecks([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [projectId]);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 px-3 py-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none italic uppercase tracking-tighter">Site Readiness</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Field Verification Portal | Phase 7.7</p>
                    </div>
                </div>
                <button className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-slate-400">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

            {/* Overall Status Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Site Status</div>
                        <div className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">Awaiting Readiness</div>
                    </div>
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                        <Construction className="w-6 h-6 text-amber-400" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-4 relative z-10 uppercase tracking-widest">
                    Dispatch [Phase 7.1] is locked until 100% readiness is achieved.
                </p>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-24 h-24" />
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading readiness checks...
                </div>
            )}
            {loadError && !isLoading && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest">
                    {loadError}
                </div>
            )}
            {!isLoading && !loadError && checks.length === 0 && (
                <div className="bg-white border border-gray-100 text-slate-400 rounded-2xl p-6 text-center text-[10px] font-black uppercase tracking-widest">
                    No readiness checks found
                </div>
            )}

            {/* Readiness Checklist */}
            <div className="space-y-4">
                {checks.map(check => (
                    <div key={check.id} className={`bg-white rounded-3xl border transition-all p-6 ${check.status === 'Ready' ? 'border-gray-100' : 'border-amber-200 bg-amber-50/20 shadow-lg shadow-amber-50'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${check.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {check.title.includes('Power') ? <Zap className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{check.title}</h3>
                                    <span className={`text-[8px] font-black uppercase inline-block px-1.5 py-0.5 rounded mt-1 ${check.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700 font-black'
                                        }`}>{check.status}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-slate-50 border border-gray-100 rounded-lg text-slate-400"><Camera className="w-4 h-4" /></button>
                                <button className="p-2 bg-slate-50 border border-gray-100 rounded-lg text-slate-400"><CheckCircle2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{check.desc}</p>
                    </div>
                ))}
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-100 transition-all hover:bg-slate-800">
                Confirm Site Attendance
            </button>
        </div>
    );
}
