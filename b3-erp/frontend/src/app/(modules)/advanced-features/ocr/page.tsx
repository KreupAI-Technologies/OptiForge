'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload, FileText, Check, Loader2, AlertCircle, ScanText } from 'lucide-react';
import Link from 'next/link';
import {
    advancedFeaturesService,
    type OcrDocument,
    type OcrStats,
} from '@/services/advanced-features.service';

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    processing: 'bg-blue-100 text-blue-700',
    queued: 'bg-gray-100 text-gray-700',
    failed: 'bg-red-100 text-red-700',
};

export default function OCRPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const [documents, setDocuments] = useState<OcrDocument[]>([]);
    const [stats, setStats] = useState<OcrStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [list, s] = await Promise.all([
                    advancedFeaturesService.listOcrDocuments(),
                    advancedFeaturesService.ocrStats(),
                ]);
                if (cancelled) return;
                setDocuments(list.data);
                setStats(s);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load OCR documents');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleUpload = () => {
        setIsUploading(true);
        setUploadStatus('processing');
        // Simulated client-side processing (upload/extraction pipeline not yet backed).
        setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('success');
        }, 2000);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/advanced-features" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">OCR Integration</h1>
                        <p className="text-gray-600 mt-1">Automated document processing and data extraction</p>
                    </div>
                </div>
            </div>

            {/* Live status counts */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {[
                    { label: 'Total', value: stats?.total ?? 0 },
                    { label: 'Completed', value: stats?.completed ?? 0 },
                    { label: 'Processing', value: stats?.processing ?? 0 },
                    { label: 'Queued', value: stats?.queued ?? 0 },
                    { label: 'Failed', value: stats?.failed ?? 0 },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                        <p className="text-2xl font-bold text-gray-900">{loading ? '—' : k.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Upload Section (simulated demo) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Upload Document</h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500 mb-2">PDF, PNG, JPG up to 10MB</p>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || uploadStatus === 'success'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors"
                            >
                                {isUploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </span>
                                ) : uploadStatus === 'success' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Processed
                                    </span>
                                ) : (
                                    'Select File'
                                )}
                            </button>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Supported Documents</h3>
                            <ul className="space-y-2">
                                {['Invoices', 'Purchase Orders', 'Receipts', 'Delivery Challans'].map((item, i) => (
                                    <li key={i} className="flex items-center text-sm text-gray-600">
                                        <Check className="w-4 h-4 text-green-500 mr-2" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Processed documents (live) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Processed Documents</h2>
                                <p className="text-sm text-gray-500">Recent OCR extraction jobs</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center gap-2 text-gray-500 py-16">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Loading documents…</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center text-center py-16">
                                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                                <p className="text-red-700 font-medium">{error}</p>
                                <p className="text-sm text-gray-500 mt-1">Please try again later.</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-16">
                                <ScanText className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-gray-900 font-medium">No documents processed yet</p>
                                <p className="text-sm text-gray-500 mt-1">Upload an invoice or receipt to get started.</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-700">File</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Type</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Status</th>
                                            <th className="px-4 py-2 font-medium text-gray-700 text-right">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {documents.map((doc) => (
                                            <tr key={doc.id}>
                                                <td className="px-4 py-2 text-gray-900">{doc.fileName}</td>
                                                <td className="px-4 py-2 text-gray-600 capitalize">{doc.docType.replace(/_/g, ' ')}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.queued}`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-900 text-right">
                                                    {doc.status === 'completed' ? `${Math.round((doc.confidence ?? 0) * 100)}%` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
