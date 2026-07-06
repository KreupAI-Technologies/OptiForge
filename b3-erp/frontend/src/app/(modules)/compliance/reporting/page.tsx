'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Plus, MoreVertical } from 'lucide-react';
import { ComplianceService, ComplianceReport } from '@/services/compliance.service';

interface ReportRow {
    id: string;
    name: string;
    type: string;
    date: string;
    status: string;
    size: string;
}

function mapReport(r: ComplianceReport): ReportRow {
    return {
        id: r.id,
        name: r.name,
        type: r.report_type,
        date: r.report_date ? String(r.report_date).slice(0, 10) : '-',
        status: r.status,
        size: r.file_size || '-',
    };
}

export default function RegulatoryReportingPage() {
    const [reports, setReports] = useState<ReportRow[]>([]);

    useEffect(() => {
        ComplianceService.getReports()
            .then((rows) => setReports(Array.isArray(rows) ? rows.map(mapReport) : []))
            .catch(() => setReports([]));
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Regulatory Reporting</h1>
                        <p className="text-sm text-gray-500 mt-1">Generate and manage compliance reports</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Generate New Report
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap flex items-center gap-2">
                        <Filter className="w-4 h-4" /> All Reports
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                        GDPR
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                        SOC 2
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                        HIPAA
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                        Internal
                    </button>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <FileText className="w-8 h-8 text-purple-600" />
                                </div>
                                <button className="p-1 hover:bg-gray-100 rounded-full">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{report.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{report.type}</p>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {report.date}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${report.status === 'Generated' ? 'bg-green-500' : 'bg-yellow-500'
                                        }`}></span>
                                    {report.status}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-sm text-gray-500">{report.size}</span>
                                {report.status === 'Generated' ? (
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Processing...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
