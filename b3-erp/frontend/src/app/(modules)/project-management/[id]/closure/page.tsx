'use client';

import React, { useState, useEffect } from 'react';
import {
    Flag,
    CheckCircle2,
    AlertCircle,
    FileSignature,
    Award,
    DollarSign,
    Hammer,
    ArrowRight,
    Printer,
    Download,
    Trophy,
    Loader2,
    ClipboardCheck
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ClosureCheck {
    id: string;
    title: string;
    status: string;
    icon: React.ReactNode;
}

interface ClosureStatus {
    snagClearance: boolean;
    billingCleared: boolean;
    handoverReady: boolean;
}

export default function ProjectClosureDashboard() {
    const params = useParams();
    const id = String(params?.id ?? '');
    const projectId = id;
    const [isSigned, setIsSigned] = useState(false);

    const [checks, setChecks] = useState<ClosureCheck[]>([]);
    const [closureStatus, setClosureStatus] = useState<ClosureStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await projectManagementService.getPmDeliverablesRaw();
                const mapped: ClosureCheck[] = (raw || []).map((r: any, idx: number) => ({
                    id: String(r.id ?? r.deliverableId ?? idx + 1),
                    title: r.title ?? r.name ?? r.deliverable ?? r.label ?? 'Deliverable',
                    status: r.status ?? 'Pending',
                    icon: <ClipboardCheck className="w-4 h-4" />,
                }));
                if (!cancelled) setChecks(mapped);
                if (projectId) {
                    try {
                        const status = await projectManagementService.getProjectClosureStatus(projectId);
                        if (!cancelled && status) {
                            setClosureStatus({
                                snagClearance: !!(status.snagClearance ?? status.snagCleared ?? false),
                                billingCleared: !!(status.billingCleared ?? status.billingComplete ?? false),
                                handoverReady: !!(status.handoverReady ?? status.readyForHandover ?? false),
                            });
                        }
                    } catch { /* closure status optional */ }
                }
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
        <div className="w-full max-w-4xl mx-auto space-y-6 px-3 py-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-100">
                        <Flag className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none italic uppercase tracking-tighter">Project Finalization</h1>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 8.18-8.20 | Closure & Handover Portal</p>
                    </div>
                </div>
                {!isSigned ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-amber-600 uppercase">Ready for Closure</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Project Completed</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Closure Checklist */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-gray-100">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Final Verification Checklist</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {isLoading && (
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest py-4 justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                </div>
                            )}
                            {loadError && !isLoading && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest">
                                    {loadError}
                                </div>
                            )}
                            {!isLoading && !loadError && checks.length === 0 && (
                                <div className="text-slate-400 rounded-2xl p-4 text-center text-[10px] font-black uppercase tracking-widest">
                                    No deliverables found
                                </div>
                            )}
                            {checks.map(check => {
                                const passed = /pass|complete|clear|done|approved/i.test(check.status);
                                return (
                                <div key={check.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-gray-50 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            {check.icon}
                                        </div>
                                        <span className="text-xs font-black text-slate-700 uppercase italic tracking-tight">{check.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${passed ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>{check.status}</span>
                                        {passed
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black uppercase italic tracking-widest">Handover Certificate</h3>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                    {closureStatus
                                        ? (closureStatus.handoverReady ? 'Ready for Handover' : 'Handover Pending')
                                        : 'Standard DIN-EN Form F.04'}
                                </p>
                            </div>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-8 relative z-10 text-center py-8 border border-dashed border-slate-700 rounded-2xl bg-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                            <FileSignature className="w-8 h-8 mx-auto text-slate-500 group-hover:text-white transition-colors" />
                            <p className="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-[0.2em] group-hover:text-slate-300">Click to Initialize Sign-off</p>
                        </div>
                    </div>
                </div>

                {/* Status and Summary */}
                <div className="space-y-6">
                    {!isSigned ? (
                        <div className="bg-white rounded-3xl border-2 border-slate-950 p-8 shadow-2xl relative">
                            <div className="absolute -top-3 left-6 px-3 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest">Action Required</div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">Client Acceptance & Handover</h2>
                            <p className="text-xs text-slate-500 font-bold mt-4 leading-relaxed uppercase tracking-wider">
                                By signing this document, the client agrees that all deliverables are met, installation is verified, and the project is officially closed.
                            </p>

                            <div className="mt-8 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signatory Name</label>
                                    <input type="text" className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500" placeholder="e.g. John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Title</label>
                                    <input type="text" className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500" placeholder="e.g. Operations Manager" />
                                </div>
                                <button
                                    onClick={() => setIsSigned(true)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200 mt-6 hover:scale-[1.02] transition-all"
                                >
                                    <FileSignature className="w-4 h-4" /> Generate Final Sign-off
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-100 text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto border-2 border-white/40">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black uppercase italic tracking-tighter">SUCCESS!</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">Project Officially Closed</p>
                            </div>
                            <div className="pt-6 space-y-3">
                                <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all">
                                    <Printer className="w-4 h-4" /> Print Handover Certificate
                                </button>
                                <button onClick={() => setIsSigned(false)} className="text-[8px] font-black text-emerald-200 uppercase underline">Reset Application</button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Project Metrics Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[8px] font-black text-slate-400 uppercase">Cycle Time</div>
                                <div className="text-lg font-black italic tracking-tighter">42 <span className="text-[10px]"> Days</span></div>
                            </div>
                            <div>
                                <div className="text-[8px] font-black text-slate-400 uppercase">Quality Score</div>
                                <div className="text-lg font-black italic tracking-tighter">98.4<span className="text-[10px]"> %</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
