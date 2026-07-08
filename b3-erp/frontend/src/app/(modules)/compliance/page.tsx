'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, FileText, Lock, AlertCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import {
    complianceService,
    ComplianceDataRequest,
    ComplianceReport,
    DataRequestSummary,
} from '@/services/compliance.service';

function timeAgo(value?: string | null): string {
    if (!value) return '';
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '';
    const days = Math.round((Date.now() - then) / 86400000);
    if (days <= 0) return 'today';
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function CompliancePage() {
    const [summary, setSummary] = useState<DataRequestSummary | null>(null);
    const [requests, setRequests] = useState<ComplianceDataRequest[]>([]);
    const [reports, setReports] = useState<ComplianceReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [sum, reqs, reps] = await Promise.all([
                    complianceService.getDataRequestSummary(),
                    complianceService.getDataRequests(),
                    complianceService.getReports(),
                ]);
                if (!active) return;
                setSummary(sum);
                setRequests(reqs);
                setReports(reps);
            } catch (e) {
                if (active) setError(e instanceof Error ? e.message : 'Failed to load compliance data');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const pending = summary?.pending ?? 0;
    const completed = summary?.completed ?? 0;
    const total = summary?.total ?? 0;
    const score = total > 0 ? Math.round((completed / total) * 100) : 100;

    // Recent alerts derived from the newest open data requests.
    const recentAlerts = [...requests]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 4);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compliance Center</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage regulatory requirements, data privacy, and audits</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium text-sm">{pending === 0 ? 'Compliant' : `${pending} Pending`}</span>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href="/compliance/gdpr" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Lock className="w-6 h-6 text-blue-600" />
                                </div>
                                {!loading && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{total}</span>}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">GDPR Controls</h3>
                            <p className="text-sm text-gray-600">
                                {loading ? 'Loading…' : `${pending} pending data request${pending === 1 ? '' : 's'}`}
                            </p>
                        </div>
                    </Link>

                    <Link href="/compliance/reporting" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-purple-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <FileText className="w-6 h-6 text-purple-600" />
                                </div>
                                {!loading && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{reports.length}</span>}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Regulatory Reporting</h3>
                            <p className="text-sm text-gray-600">
                                {loading ? 'Loading…' : `${reports.length} report${reports.length === 1 ? '' : 's'} on file`}
                            </p>
                        </div>
                    </Link>

                    <Link href="/compliance/audit" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-orange-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Audit Logs</h3>
                            <p className="text-sm text-gray-600">Track system events and user activities</p>
                        </div>
                    </Link>
                </div>

                {/* Compliance Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Compliance Scorecard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Request Resolution</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{loading ? '—' : `${score}%`}</span>
                                    <span className="text-sm text-gray-500 font-medium mb-1">closed</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Pending Requests</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{loading ? '—' : pending}</span>
                                    <span className="text-sm text-gray-500 font-medium mb-1">DSRs</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Reports Filed</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{loading ? '—' : reports.length}</span>
                                    <span className="text-sm text-gray-500 font-medium mb-1">total</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Recent Reports</h3>
                            {loading ? (
                                <div className="flex items-center justify-center py-8 text-gray-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="py-6 text-center text-sm text-gray-500">No regulatory reports yet.</div>
                            ) : (
                                reports.slice(0, 5).map((r) => (
                                    <div key={r.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-2 h-2 rounded-full ${r.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <span className="font-medium text-gray-900 truncate">{r.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">{r.report_type} · {r.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Requests</h2>
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        ) : recentAlerts.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500">No data-subject requests yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {recentAlerts.map((a) => (
                                    <div key={a.id} className="flex gap-3">
                                        <div className={`mt-1 ${a.status === 'pending' ? 'text-yellow-500' : a.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`}>
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{a.reference} · {a.request_type}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{a.subject_name} — {a.status}</p>
                                            <p className="text-xs text-gray-400 mt-1">{timeAgo(a.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href="/compliance/gdpr" className="block w-full mt-6 py-2 text-sm text-center text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
                            View All Requests
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
