'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Download, User, Shield, AlertCircle, FileText } from 'lucide-react';
import { AuditLogService } from '@/services/audit-log.service';

interface AuditLogRow {
    id: string;
    action: string;
    user: string;
    ip: string;
    time: string;
    status: string;
    details: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Backend returns a paginated envelope of raw audit log records;
                // map each to the page's flat row model.
                const res = (await AuditLogService.getAuditLogs()) as any;
                const raw: any[] = Array.isArray(res) ? res : (res?.data ?? []);
                const severityToStatus = (sev: any): string => {
                    const s = String(sev ?? '').toLowerCase();
                    if (s.includes('critical') || s.includes('error') || s.includes('high')) return 'failure';
                    if (s.includes('warn') || s.includes('medium')) return 'warning';
                    return 'success';
                };
                const mapped: AuditLogRow[] = raw.map((l, i) => {
                    const ts = l.timestamp ?? l.createdAt ?? l.time;
                    const time = ts ? new Date(ts).toLocaleString() : '';
                    return {
                        id: String(l.id ?? `LOG-${i}`),
                        action: String(l.action ?? l.description ?? 'Event'),
                        user: String(l.userEmail ?? l.userName ?? l.user ?? 'unknown'),
                        ip: String(l.ipAddress ?? l.ip ?? '-'),
                        time,
                        status: l.status ? String(l.status).toLowerCase() : severityToStatus(l.severity),
                        details: String(l.description ?? l.details ?? ''),
                    };
                });
                if (!cancelled) setLogs(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load audit logs');
                    setLogs([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        <p className="text-sm text-gray-500 mt-1">Detailed record of system events and user activities</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading audit logs…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && logs.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        No audit logs found.
                    </div>
                )}

                {/* Search and Filter */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search logs by user, action, or IP..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{log.time}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900">{log.action}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{log.user}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600 font-mono">{log.ip}</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-green-100 text-green-800' :
                                                log.status === 'failure' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {log.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
