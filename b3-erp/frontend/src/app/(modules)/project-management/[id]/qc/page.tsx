'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    ClipboardCheck,
    ShieldCheck,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Camera,
    Hash
} from 'lucide-react';

export default function FinalQCPage() {
    const { id: projectId } = useParams() as { id: string };
    const [status, setStatus] = useState<'IDLE' | 'FAIL' | 'PASS'>('IDLE');
    const [reworkTarget, setReworkTarget] = useState('Back to Bending (Op 5.7)');
    const [saving, setSaving] = useState(false);

    const recordVerdict = async (verdict: 'Passed' | 'Failed') => {
        setSaving(true);
        try {
            await projectManagementService.createQualityInspection({
                companyId: 'default-company-id',
                projectId,
                inspectionType: 'Final Inspection',
                overallStatus: verdict,
                remarks: verdict === 'Failed' ? `Rework: ${reworkTarget}` : 'Final QC passed',
            } as any);
        } catch {
            /* keep UI state even if persistence fails */
        } finally {
            setSaving(false);
            setStatus(verdict === 'Passed' ? 'PASS' : 'FAIL');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4 px-3 py-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none italic uppercase tracking-tighter">Final Quality Audit</h1>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 6.1-6.3 | Inspection & Rework Loop</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspection ID</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">QC-2026-F0421</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Audit Checklist */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inspection Checklist</h2>
                            <span className="text-[10px] font-bold text-indigo-600">4 Points Pending</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                'Dimensional Accuracy (Tolerance ±0.5mm)',
                                'Logo Etching Depth & Alignment',
                                'Surface Finish (No Scratches/Dents)',
                                'Edge Deburring & Smoothness'
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-gray-50 hover:border-indigo-100 transition-all group">
                                    <span className="text-xs font-bold text-slate-700">{item}</span>
                                    <div className="flex gap-2">
                                        <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-200 transition-all"><AlertTriangle className="w-4 h-4" /></button>
                                        <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:border-emerald-200 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                <Camera className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach Proof Images</span>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Upload</button>
                    </div>
                </div>

                {/* Audit Verdict */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center space-y-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Verdict</div>

                        {status === 'IDLE' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => recordVerdict('Passed')}
                                    disabled={saving}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    Approve & Pass
                                </button>
                                <button
                                    onClick={() => recordVerdict('Failed')}
                                    disabled={saving}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    Reject for Rework
                                </button>
                            </div>
                        )}

                        {status === 'PASS' && (
                            <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-black text-emerald-600 uppercase italic">Passed Inspection</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto-Moving to Packaging Phase</p>
                                <button onClick={() => setStatus('IDLE')} className="text-[8px] font-black text-slate-300 uppercase underline">Undo</button>
                            </div>
                        )}

                        {status === 'FAIL' && (
                            <div className="space-y-4 animate-in zoom-in-95 duration-300 text-left">
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2">
                                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Rework Target</div>
                                    <select value={reworkTarget} onChange={(e) => setReworkTarget(e.target.value)} className="w-full bg-white border border-rose-100 rounded-lg p-2 text-[10px] font-bold outline-none">
                                        <option>Back to Bending (Op 5.7)</option>
                                        <option>Back to Laser (Op 5.3)</option>
                                        <option>Back to Etching (Op 5.6)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setStatus('IDLE')}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Trigger Rework
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 overflow-hidden relative">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defect Analytics</div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span>Surface Scratches</span>
                                <span className="text-rose-400">12%</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[12%]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold pt-2">
                                <span>Dimensional Errors</span>
                                <span className="text-rose-400">4%</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[4%]"></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-10">
                            <RotateCcw className="w-24 h-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
