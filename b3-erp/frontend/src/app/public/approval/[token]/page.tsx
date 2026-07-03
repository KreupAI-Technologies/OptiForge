'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { designVerificationService } from '@/services/DesignVerificationService';
import { HandoverService } from '@/services/HandoverService';
import { SignatureCanvas } from '@/components/ui/SignatureCanvas';
import {
    ShieldCheck,
    FileText,
    PenTool,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    ChevronRight
} from 'lucide-react';

export default function ClientApprovalPortal() {
    const { token } = useParams() as { token: string };
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'design'; // 'design' or 'handover'

    const [approvalData, setApprovalData] = useState<any>(null);
    const [isSigned, setIsSigned] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientTitle, setClientTitle] = useState('');
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            loadApproval();
        }
    }, [token]);

    const loadApproval = async () => {
        try {
            if (type === 'handover') {
                // For handover, the token would be the certificate ID (simulation)
                const data = await HandoverService.getCertificate(token);
                setApprovalData(data);
                if (data.status === 'signed') setIsSigned(true);
            } else {
                const data = await designVerificationService.getApprovalByToken(token);
                setApprovalData(data);
                if (data.status === 'APPROVED') setIsSigned(true);
            }
        } catch (err) {
            setError('Invalid or expired approval link');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOff = async () => {
        if (!clientName) return alert('Please enter your name');
        if (!signatureData) return alert('Please provide your signature');

        try {
            if (type === 'handover') {
                await HandoverService.signHandover(approvalData.id, clientName, clientTitle, signatureData);
            } else {
                await designVerificationService.submitApproval({
                    token,
                    status: 'APPROVED',
                    comments: `Signed by ${clientName}${clientTitle ? `, ${clientTitle}` : ''}`
                });
            }
            setIsSigned(true);
        } catch (err) {
            alert('Failed to submit approval');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black uppercase italic tracking-widest text-slate-400">Loading Secure Portal...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black uppercase italic tracking-widest text-rose-500">{error}</div>;

    const asset = {
        name: type === 'handover' ? 'Project Handover Certificate' : (approvalData?.attachment?.fileName || 'Technical Drawing'),
        type: type === 'handover' ? 'Final Acceptance' : (approvalData?.attachment?.category || 'Project Document'),
        ref: type === 'handover' ? approvalData?.id?.substring(0, 8).toUpperCase() : (approvalData?.id?.substring(0, 8).toUpperCase() || 'DWG-REF'),
        date: new Date(approvalData?.createdAt).toLocaleDateString() || 'N/A'
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Document Preview */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                                {type === 'handover' ? 'Final Handover' : 'Document Review'}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{approvalData?.project?.name || 'Manufacturing Project'}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                            <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center border border-indigo-100">
                            <Eye className="w-10 h-10 text-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{asset.name}</h3>
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.ref}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.date}</span>
                            </div>
                        </div>
                        {type === 'design' && (
                            <a
                                href={approvalData?.attachment?.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"
                            >
                                <Download className="w-4 h-4" /> Download Original File
                            </a>
                        )}
                        {type === 'handover' && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Scope of Handover</p>
                                <p className="text-xs text-blue-600 font-medium">Installation completed, site cleaned, and tools returned. Joint inspection cleared.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                {!isSigned ? 'Action Required: Awaiting Sign-off' : `Status: ${type === 'handover' ? 'Signed' : 'Approved'}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Approval Actions */}
                <div className="flex flex-col justify-center space-y-6">
                    {!isSigned ? (
                        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 space-y-6">
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-900 leading-none italic uppercase tracking-tighter">Confirm & Approve</h2>
                                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                                    {type === 'handover'
                                        ? 'By signing, you accept the installation as complete and ready for billing.'
                                        : 'By signing, you authorize production to proceed based on these specifications.'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signatory Name</label>
                                        <input
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title / Position</label>
                                        <input
                                            type="text"
                                            value={clientTitle}
                                            onChange={(e) => setClientTitle(e.target.value)}
                                            className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="e.g. Project Manager"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature</label>
                                    <SignatureCanvas onSave={(data) => setSignatureData(data)} />
                                </div>
                            </div>

                            <button
                                onClick={handleSignOff}
                                disabled={!signatureData || !clientName}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4" /> {type === 'handover' ? 'Finalize Handover' : 'Submit Approval'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-emerald-600 rounded-[40px] p-12 text-white shadow-2xl shadow-emerald-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto border-4 border-white/40">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                                    {type === 'handover' ? 'HANDED OVER' : 'APPROVED'}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-100">Reference: {asset.ref}</p>
                            </div>
                            <p className="text-sm font-bold text-emerald-100 leading-relaxed uppercase tracking-widest px-4">
                                Thank you. The project team has been notified. You can now close this window.
                            </p>
                            {type === 'handover' && (
                                <button
                                    onClick={() => window.open(approvalData?.certificateUrl)}
                                    className="w-full py-4 bg-white text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Certificate
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">SSL SECURED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">OPTIFORGE v3.1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
