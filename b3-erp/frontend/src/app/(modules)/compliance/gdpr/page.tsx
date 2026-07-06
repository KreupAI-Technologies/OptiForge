'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, Download, Trash2, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import { ComplianceService, ComplianceDataRequest, DataRequestSummary } from '@/services/compliance.service';

interface DsrRow {
    id: string;
    user: string;
    type: string;
    status: string;
    date: string;
    deadline: string;
}

function mapRequest(r: ComplianceDataRequest): DsrRow {
    return {
        id: r.reference || r.id,
        user: r.subject_name,
        type: r.request_type,
        status: r.status,
        date: r.received_at ? String(r.received_at).slice(0, 10) : '-',
        deadline: r.deadline_at ? String(r.deadline_at).slice(0, 10) : '-',
    };
}

export default function GDPRPage() {
    const [requests, setRequests] = useState<DsrRow[]>([]);
    const [summary, setSummary] = useState<DataRequestSummary | null>(null);

    useEffect(() => {
        ComplianceService.getDataRequests()
            .then((rows) => setRequests(Array.isArray(rows) ? rows.map(mapRequest) : []))
            .catch(() => setRequests([]));
        ComplianceService.getDataRequestSummary()
            .then(setSummary)
            .catch(() => setSummary(null));
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">GDPR Controls</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage Data Subject Requests (DSRs) and privacy settings</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Log
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Privacy Settings
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Total Requests</p>
                        <p className="text-3xl font-bold text-gray-900">{summary?.total ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{summary?.pending ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-green-600">{summary?.completed ?? 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Processing</p>
                        <p className="text-3xl font-bold text-blue-600">{summary?.processing ?? 0}</p>
                    </div>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Data Subject Requests</h2>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <Filter className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Request ID</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Date Received</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-medium text-gray-900">{req.id}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {req.user[0]}
                                        </div>
                                        {req.user}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{req.type}</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                req.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{req.date}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{req.deadline}</td>
                                    <td className="px-3 py-2">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
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
