'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Package,
    DollarSign,
    Users,
    Calendar,
    ClipboardCheck,
    Send,
} from 'lucide-react';

interface VerificationCheck {
    id: string;
    category: string;
    checkName: string;
    status: 'Pass' | 'Fail' | 'Warning';
    details: string;
}

interface BOMVerification {
    id: string;
    bomCode: string;
    productName: string;
    verificationDate: string;
    verifiedBy: string;
    status: 'Verified' | 'Pending' | 'Failed' | 'In Review';
    completeness: number;
    checks: VerificationCheck[];
    submittedToProcurement: boolean;
}

export default function BOMVerificationPage() {
    const [verifications, setVerifications] = useState<BOMVerification[]>([]);
    const [selectedVerification, setSelectedVerification] = useState<BOMVerification | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const rows = await ProductionOrphanService.getBomVerifications();
                if (!active) return;
                const mapped: BOMVerification[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
                    id: String(r.id ?? ''),
                    bomCode: r.bomCode ?? r.bom_code ?? '',
                    productName: r.productName ?? r.product_name ?? '',
                    verificationDate: r.verificationDate ?? r.verification_date ?? '',
                    verifiedBy: r.verifiedBy ?? r.verified_by ?? '',
                    status: (r.status ?? 'Pending') as BOMVerification['status'],
                    completeness: Number(r.completeness ?? 0),
                    submittedToProcurement: Boolean(r.submittedToProcurement ?? r.submitted_to_procurement ?? false),
                    checks: Array.isArray(r.checks)
                        ? r.checks.map((c: any, idx: number) => ({
                              id: String(c?.id ?? idx + 1),
                              category: c?.category ?? '',
                              checkName: c?.checkName ?? c?.check_name ?? '',
                              status: (c?.status ?? 'Pass') as VerificationCheck['status'],
                              details: c?.details ?? '',
                          }))
                        : [],
                }));
                setVerifications(mapped);
            } catch (e: any) {
                if (active) setError(e?.message || 'Failed to load BOM verifications');
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified':
                return 'bg-green-100 text-green-800';
            case 'In Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCheckIcon = (status: string) => {
        switch (status) {
            case 'Pass':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'Fail':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const stats = {
        total: verifications.length,
        verified: verifications.filter((v) => v.status === 'Verified').length,
        inReview: verifications.filter((v) => v.status === 'In Review').length,
        failed: verifications.filter((v) => v.status === 'Failed').length,
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/production/bom"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    BOM Verification & Completeness Check
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Phase 3: Verify BOM completeness before procurement submission
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Loading BOM verifications…
                    </div>
                )}
                {error && !loading && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total BOMs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Review</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inReview}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Verifications List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">BOM Verification Status</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {verifications.map((verification) => (
                            <div key={verification.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {verification.bomCode} - {verification.productName}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Verification Date</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {verification.verificationDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Verified By</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {verification.verifiedBy}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Completeness</p>
                                                <p className="font-medium text-gray-900">{verification.completeness}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Procurement</p>
                                                <p className={`font-medium ${verification.submittedToProcurement ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {verification.submittedToProcurement ? 'Submitted ✓' : 'Not Submitted'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Verification Progress</span>
                                                <span className="font-medium text-gray-900">{verification.completeness}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${verification.completeness === 100
                                                            ? 'bg-green-600'
                                                            : verification.completeness >= 80
                                                                ? 'bg-yellow-600'
                                                                : 'bg-red-600'
                                                        }`}
                                                    style={{ width: `${verification.completeness}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            {verification.checks.filter((c) => c.status === 'Pass').length > 0 && (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {verification.checks.filter((c) => c.status === 'Pass').length} passed
                                                </span>
                                            )}
                                            {verification.checks.filter((c) => c.status === 'Warning').length > 0 && (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {verification.checks.filter((c) => c.status === 'Warning').length} warnings
                                                </span>
                                            )}
                                            {verification.checks.filter((c) => c.status === 'Fail').length > 0 && (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="w-4 h-4" />
                                                    {verification.checks.filter((c) => c.status === 'Fail').length} failed
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-6 flex flex-col items-end gap-3">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(verification.status)}`}>
                                            {verification.status}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedVerification(verification);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium"
                                            >
                                                <ClipboardCheck className="w-4 h-4 inline mr-1" />
                                                View Details
                                            </button>
                                            {verification.status === 'Verified' && !verification.submittedToProcurement && (
                                                <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium">
                                                    <Send className="w-4 h-4 inline mr-1" />
                                                    Submit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Modal */}
                {showDetailsModal && selectedVerification && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-3 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">Verification Checklist</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{selectedVerification.productName}</h3>
                                <p className="text-sm text-gray-600">{selectedVerification.bomCode}</p>
                            </div>

                            <div className="space-y-3">
                                {selectedVerification.checks.map((check) => (
                                    <div
                                        key={check.id}
                                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                                    >
                                        {getCheckIcon(check.status)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-semibold text-gray-900">{check.checkName}</h4>
                                                <span className={`text-xs px-2 py-1 rounded-full ${check.status === 'Pass' ? 'bg-green-100 text-green-800' :
                                                        check.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {check.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">{check.category}</p>
                                            <p className="text-sm text-gray-700">{check.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {selectedVerification.status === 'Verified' && (
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Submit to Procurement
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">About BOM Verification</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Step 3.11: Verify BOM completeness before submitting to procurement. System checks
                                for part numbers, quantities, supplier assignments, cost estimates, and proper
                                categorization of accessories and fittings. Only 100% verified BOMs can be submitted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
