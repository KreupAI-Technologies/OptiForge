'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    CheckCircle,
    XCircle,
    FileText,
    Shield,
    Download,
    Eye,
    PenTool,
    MessageCircle,
    Lock,
    Loader2
} from 'lucide-react';
import { designVerificationService } from '@/services/DesignVerificationService';

export default function ClientApprovalPortal() {
    const { projectId, token } = useParams() as { projectId: string, token: string };
    const [status, setStatus] = useState<'review' | 'success' | 'reject'>('review');
    const [approval, setApproval] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rejectComments, setRejectComments] = useState('');

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        designVerificationService
            .getApprovalByToken(token)
            .then((data) => {
                if (cancelled) return;
                setApproval(data);
                if (data?.status === 'APPROVED') setStatus('success');
                else if (data?.status === 'REJECTED') setStatus('reject');
            })
            .catch(() => { /* keep review view; token may be invalid */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [token]);

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            await designVerificationService.submitApproval({ token, status: 'APPROVED' });
            setStatus('success');
        } catch {
            alert('Failed to submit approval. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        setSubmitting(true);
        try {
            await designVerificationService.submitApproval({ token, status: 'REJECTED', comments: rejectComments });
            setStatus('reject');
        } catch {
            alert('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Branded Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex flex-col items-center">
                <div className="text-xl font-black text-slate-900 leading-none flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    OptiForge <span className="text-gray-400 font-bold border-l pl-2 border-gray-200">Client Portal</span>
                </div>
            </div>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
                {status === 'review' ? (
                    <>
                        {/* Approval Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-black text-gray-900 leading-tight">Review & Approval Required</h1>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Project: Industrial Kitchen 2026-B</p>
                        </div>

                        {/* Document Preview Card */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black uppercase tracking-wider italic">Kitchen_Layout_v3.dwg</div>
                                        <div className="text-[10px] text-blue-300 font-bold uppercase">Final Submittal for Production</div>
                                    </div>
                                </div>
                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"
                                    className="w-full h-full object-cover blur-[2px] opacity-40"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                                        <Eye className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-transform">
                                        Click to Preview Full Drawing
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50/30">
                                <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3">Project Team Note</h3>
                                <p className="text-sm text-slate-700 italic border-l-4 border-blue-400 pl-4 py-1 leading-relaxed">
                                    "Dear Client, please review the final placement of the electrical conduits and the drainage slope. Once approved, we will begin the stainless steel fabrication process."
                                </p>
                            </div>
                        </div>

                        {/* Signature Pad Section */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Formal Authorization</div>
                                <h2 className="text-lg font-black text-gray-900 italic uppercase tracking-wider">Sign to Approve</h2>
                            </div>

                            <div className="border-4 border-dashed border-gray-100 rounded-3xl h-48 bg-gray-50/50 flex flex-col items-center justify-center gap-3 group hover:border-blue-100 transition-all cursor-crosshair">
                                <PenTool className="w-10 h-10 text-gray-200 group-hover:text-blue-300 transition-colors" />
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-blue-400 italic">Sign here...</span>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={() => setStatus('reject')}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 border-2 border-rose-200 text-rose-600 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-rose-50 transition-all disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Request Changes
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                    Sign & Approve
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
                                <Lock className="w-3.5 h-3.5" />
                                This is a legally binding electronic signature via OptiForge ID
                            </div>
                        </div>
                    </>
                ) : status === 'success' ? (
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-50">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 leading-none">Drawing Approved!</h2>
                            <p className="text-gray-500 mt-4 font-medium max-w-sm mx-auto">Thank you for your response. Our production team has been notified and will proceed with fabrication.</p>
                        </div>
                        <div className="pt-6">
                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 px-4 py-2 rounded-full">
                                Reference ID: LOG-V3-{Date.now().toString().slice(-6)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-xl shadow-rose-50">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 leading-none italic uppercase">Revisions Requested</h2>
                        <div className="pt-4 max-w-md mx-auto">
                            <textarea
                                placeholder="Tell us what needs to be changed..."
                                value={rejectComments}
                                onChange={(e) => setRejectComments(e.target.value)}
                                disabled={approval?.status === 'REJECTED'}
                                className="w-full h-32 p-4 bg-slate-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
                            />
                        </div>
                        <button
                            onClick={handleReject}
                            disabled={submitting || approval?.status === 'REJECTED'}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {approval?.status === 'REJECTED' ? 'Revision Request Submitted' : 'Submit Revision Request'}
                        </button>
                    </div>
                )}
            </main>

            <footer className="p-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] space-y-4">
                <div className="flex items-center justify-center gap-6">
                    <span>Legal</span>
                    <span>Privacy</span>
                    <span>OptiForge © 2026</span>
                </div>
            </footer>
        </div>
    );
}
