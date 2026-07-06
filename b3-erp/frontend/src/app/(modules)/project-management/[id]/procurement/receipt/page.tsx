'use client';

import React, { useState } from 'react';
import {
    Truck,
    ScanBarcode,
    CheckCircle2,
    AlertCircle,
    Camera,
    ClipboardCheck,
    ArrowLeft
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';

export default function GoodsReceiptPage() {
    const { id } = useParams() as { id: string };
    const [step, setStep] = useState(1);
    const [poRef, setPoRef] = useState('');
    const [deliveryNote, setDeliveryNote] = useState('');
    const [qcPassed, setQcPassed] = useState(false);
    const [noDamage, setNoDamage] = useState(false);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const postReceipt = async () => {
        setPosting(true);
        setPostError(null);
        try {
            await projectManagementService.createGoodsReceipt({
                purchaseOrderId: poRef,
                receivedBy: 'default-company-id',
                deliveryNoteRef: deliveryNote,
            });
            setStep(3);
        } catch (e) {
            setPostError(e instanceof Error ? e.message : 'Failed to post GRN');
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 px-3 py-4">
            <div className="flex items-center gap-4 mb-2">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none uppercase italic italic tracking-tighter">Goods Receipt (GRN)</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Mobile Receiving Terminal</p>
                </div>
            </div>

            {/* GRN Form */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
                <div className="p-1 flex">
                    <div className={`flex-1 py-1 text-center rounded-2xl text-[8px] font-black uppercase tracking-tighter transition-all ${step === 1 ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>1. Reference</div>
                    <div className={`flex-1 py-1 text-center rounded-2xl text-[8px] font-black uppercase tracking-tighter transition-all ${step === 2 ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>2. Inspection</div>
                    <div className={`flex-1 py-1 text-center rounded-2xl text-[8px] font-black uppercase tracking-tighter transition-all ${step === 3 ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>3. Completion</div>
                </div>

                <div className="p-6 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Purchase Order Reference</label>
                                <div className="relative">
                                    <input
                                        value={poRef}
                                        onChange={(e) => setPoRef(e.target.value)}
                                        placeholder="PO-2026-0042"
                                        className="w-full p-4 bg-slate-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                    <ScanBarcode className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Delivery Note #</label>
                                <input
                                    value={deliveryNote}
                                    onChange={(e) => setDeliveryNote(e.target.value)}
                                    placeholder="DN-VEND-9981"
                                    className="w-full p-4 bg-slate-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Start Inward Inspection
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-[10px] text-amber-700 font-bold leading-relaxed italic">
                                    Mandatory Quality Check: Verify Item Counts vs PO before final receipt.
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border border-gray-100 rounded-2xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Technical QC Passed?</span>
                                        <input type="checkbox" checked={qcPassed} onChange={(e) => setQcPassed(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">No Visible Damage?</span>
                                        <input type="checkbox" checked={noDamage} onChange={(e) => setNoDamage(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 p-8 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-slate-300 transition-all">
                                        <Camera className="w-6 h-6 text-slate-400" />
                                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest italic">Upload Proof</span>
                                    </button>
                                    <button className="flex-1 p-8 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-slate-300 transition-all">
                                        <ClipboardCheck className="w-6 h-6 text-slate-400" />
                                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest italic">Checklist</span>
                                    </button>
                                </div>
                            </div>

                            {postError && (
                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{postError}</div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep(1)} className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest">Back</button>
                                <button onClick={postReceipt} disabled={posting || !poRef} className="grow-[2] p-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 disabled:opacity-50">{posting ? 'Posting…' : 'Post Receipt (GRN)'}</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Receipt Successful</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Inventory updated for {poRef || 'PO'}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 max-w-xs mx-auto">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Stock Location</div>
                                <div className="text-xs font-black text-slate-700 italic">Project Bin: B-42 | Main Warehouse</div>
                            </div>
                            <button className="w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Print Label</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
