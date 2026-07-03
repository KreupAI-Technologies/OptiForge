'use client';

import React, { useState } from 'react';
import {
    FileSearch,
    Search,
    Filter,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Download,
    Eye,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Calendar,
    Truck,
    Package,
    BarChart3,
    FileText,
    RefreshCw
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

// Mock Audit Data
const auditStats = {
    totalAudited: 342,
    discrepancies: 28,
    recovered: 45600,
    pendingReview: 15,
    accuracy: 91.8,
    avgVariance: 3.2
};

const auditRecords = [
    {
        id: 'AUD-2024-0089',
        invoiceNo: 'INV-2024-5612',
        carrier: 'Emirates Logistics',
        shipmentId: 'SHP-2024-1203',
        originalAmount: 48500,
        auditedAmount: 45200,
        variance: -3300,
        varianceType: 'Overcharge',
        status: 'Disputed',
        auditDate: '2024-01-20',
        category: 'Weight Discrepancy'
    },
    {
        id: 'AUD-2024-0088',
        invoiceNo: 'INV-2024-5608',
        carrier: 'Fast Track Shipping',
        shipmentId: 'SHP-2024-1198',
        originalAmount: 32000,
        auditedAmount: 32000,
        variance: 0,
        varianceType: 'Correct',
        status: 'Verified',
        auditDate: '2024-01-19',
        category: 'N/A'
    },
    {
        id: 'AUD-2024-0087',
        invoiceNo: 'INV-2024-5601',
        carrier: 'Gulf Express',
        shipmentId: 'SHP-2024-1195',
        originalAmount: 125000,
        auditedAmount: 118500,
        variance: -6500,
        varianceType: 'Overcharge',
        status: 'Recovered',
        auditDate: '2024-01-18',
        category: 'Fuel Surcharge Error'
    },
    {
        id: 'AUD-2024-0086',
        invoiceNo: 'INV-2024-5595',
        carrier: 'Quick Delivery Co',
        shipmentId: 'SHP-2024-1190',
        originalAmount: 18500,
        auditedAmount: 19200,
        variance: 700,
        varianceType: 'Undercharge',
        status: 'Adjusted',
        auditDate: '2024-01-17',
        category: 'Additional Services'
    },
    {
        id: 'AUD-2024-0085',
        invoiceNo: 'INV-2024-5588',
        carrier: 'Northern Logistics',
        shipmentId: 'SHP-2024-1185',
        originalAmount: 85000,
        auditedAmount: 82300,
        variance: -2700,
        varianceType: 'Overcharge',
        status: 'Pending Review',
        auditDate: '2024-01-16',
        category: 'Rate Discrepancy'
    },
    {
        id: 'AUD-2024-0084',
        invoiceNo: 'INV-2024-5582',
        carrier: 'Maersk',
        shipmentId: 'SHP-2024-1180',
        originalAmount: 42000,
        auditedAmount: 42000,
        variance: 0,
        varianceType: 'Correct',
        status: 'Verified',
        auditDate: '2024-01-15',
        category: 'N/A'
    },
    {
        id: 'AUD-2024-0083',
        invoiceNo: 'INV-2024-5575',
        carrier: 'Emirates SkyCargo',
        shipmentId: 'SHP-2024-1175',
        originalAmount: 156000,
        auditedAmount: 148500,
        variance: -7500,
        varianceType: 'Overcharge',
        status: 'Disputed',
        auditDate: '2024-01-14',
        category: 'Dimensional Weight'
    }
];

export default function FreightAuditPage() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-green-50 text-green-600 border-green-200';
            case 'Disputed': return 'bg-red-50 text-red-600 border-red-200';
            case 'Recovered': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Adjusted': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'Pending Review': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getVarianceColor = (variance: number) => {
        if (variance < 0) return 'text-red-600';
        if (variance > 0) return 'text-blue-600';
        return 'text-green-600';
    };

    const filteredRecords = auditRecords.filter(record => {
        if (filter === 'all') return true;
        if (filter === 'discrepancies') return record.variance !== 0;
        if (filter === 'verified') return record.status === 'Verified';
        if (filter === 'disputed') return record.status === 'Disputed';
        if (filter === 'pending') return record.status === 'Pending Review';
        return true;
    });

    return (
        <div className="p-6 space-y-3 text-sm font-medium">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileSearch className="h-8 w-8 text-orange-600" />
                        Freight Audit
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
                        Invoice verification and cost recovery
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Run Audit
                    </button>
                    <button onClick={() => exportToCsv('freight-audit', filteredRecords)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Audited</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{auditStats.totalAudited}</p>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Discrepancies</p>
                            <p className="text-2xl font-black text-red-600 mt-1 italic tracking-tighter">{auditStats.discrepancies}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Recovered</p>
                            <p className="text-2xl font-black text-green-600 mt-1 italic tracking-tighter">
                                ${(auditStats.recovered / 1000).toFixed(1)}K
                            </p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Pending Review</p>
                            <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter">{auditStats.pendingReview}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Accuracy</p>
                            <p className="text-2xl font-black text-blue-600 mt-1 italic tracking-tighter">{auditStats.accuracy}%</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Variance</p>
                            <p className="text-2xl font-black text-white mt-1 italic tracking-tighter">{auditStats.avgVariance}%</p>
                        </div>
                        <div className="p-2 bg-gray-800 rounded-lg text-orange-500">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['all', 'discrepancies', 'verified', 'disputed', 'pending'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${filter === f
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search audits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-3 py-2">Audit ID</th>
                                <th className="px-3 py-2">Invoice / Shipment</th>
                                <th className="px-3 py-2">Carrier</th>
                                <th className="px-3 py-2 text-right">Original</th>
                                <th className="px-3 py-2 text-right">Audited</th>
                                <th className="px-3 py-2 text-right">Variance</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-center">Status</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <td className="px-3 py-2">
                                        <span className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {record.id}
                                        </span>
                                        <p className="text-[9px] text-gray-400">{record.auditDate}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="text-[10px]">
                                            <p className="font-bold text-gray-900">{record.invoiceNo}</p>
                                            <p className="text-gray-400">{record.shipmentId}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="font-bold text-gray-700">{record.carrier}</span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-600">
                                        ${record.originalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                                        ${record.auditedAmount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <span className={`font-black ${getVarianceColor(record.variance)} flex items-center justify-end gap-1`}>
                                            {record.variance !== 0 && (
                                                record.variance < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
                                            )}
                                            ${Math.abs(record.variance).toLocaleString()}
                                        </span>
                                        <p className="text-[9px] text-gray-400">{record.varianceType}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="text-[10px] text-gray-600">{record.category}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                                                <Eye className="w-3 h-3" />
                                            </button>
                                            {record.status === 'Pending Review' && (
                                                <button className="p-1.5 bg-green-100 rounded-lg text-green-600 hover:bg-green-200 transition-colors">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Top Discrepancy Categories
                    </h4>
                    <ul className="space-y-2 text-[11px] text-red-700">
                        <li className="flex justify-between"><span>Weight Discrepancy</span><span className="font-bold">12</span></li>
                        <li className="flex justify-between"><span>Fuel Surcharge Error</span><span className="font-bold">8</span></li>
                        <li className="flex justify-between"><span>Rate Discrepancy</span><span className="font-bold">5</span></li>
                    </ul>
                </div>

                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <h4 className="text-xs font-black text-green-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Recovery Summary
                    </h4>
                    <ul className="space-y-2 text-[11px] text-green-700">
                        <li className="flex justify-between"><span>This Month</span><span className="font-bold">$12,400</span></li>
                        <li className="flex justify-between"><span>Last Month</span><span className="font-bold">$18,200</span></li>
                        <li className="flex justify-between"><span>YTD Total</span><span className="font-bold">$45,600</span></li>
                    </ul>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Carrier Accuracy
                    </h4>
                    <ul className="space-y-2 text-[11px] text-blue-700">
                        <li className="flex justify-between"><span>Emirates Logistics</span><span className="font-bold">94%</span></li>
                        <li className="flex justify-between"><span>Fast Track Shipping</span><span className="font-bold">98%</span></li>
                        <li className="flex justify-between"><span>Gulf Express</span><span className="font-bold">89%</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
