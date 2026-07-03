'use client';

import React, { useState } from 'react';
import {
    FileText,
    Search,
    Plus,
    Filter,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ChevronRight,
    MoreVertical,
    Download,
    Eye,
    Edit,
    Truck,
    Building2,
    AlertCircle
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

// Mock Contract Data
const contractStats = {
    totalContracts: 18,
    active: 12,
    expiringSoon: 3,
    expired: 2,
    pendingRenewal: 1,
    totalValue: 2450000
};

const contracts = [
    {
        id: 'CON-2024-001',
        carrier: 'Emirates Logistics',
        type: 'Full Service',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        value: 450000,
        status: 'Active',
        routes: ['Dubai - Abu Dhabi', 'Dubai - Sharjah', 'UAE - Oman'],
        sla: '98% On-Time',
        rateType: 'Per KG',
        baseRate: 12.5,
        renewalStatus: 'Auto-Renew'
    },
    {
        id: 'CON-2024-002',
        carrier: 'Fast Track Shipping',
        type: 'Standard',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        value: 320000,
        status: 'Active',
        routes: ['UAE - KSA', 'UAE - Bahrain'],
        sla: '95% On-Time',
        rateType: 'Per Shipment',
        baseRate: 850,
        renewalStatus: 'Manual'
    },
    {
        id: 'CON-2024-003',
        carrier: 'Gulf Express',
        type: 'Express',
        startDate: '2023-06-01',
        endDate: '2024-05-31',
        value: 280000,
        status: 'Expiring Soon',
        routes: ['Dubai - Qatar', 'Abu Dhabi - Kuwait'],
        sla: '99% On-Time',
        rateType: 'Per KG',
        baseRate: 15.0,
        renewalStatus: 'Pending Review'
    },
    {
        id: 'CON-2024-004',
        carrier: 'Quick Delivery Co',
        type: 'Last Mile',
        startDate: '2024-03-15',
        endDate: '2025-03-14',
        value: 180000,
        status: 'Active',
        routes: ['Dubai Metro Area', 'Sharjah Metro Area'],
        sla: '96% On-Time',
        rateType: 'Per Delivery',
        baseRate: 45,
        renewalStatus: 'Auto-Renew'
    },
    {
        id: 'CON-2024-005',
        carrier: 'Northern Logistics',
        type: 'Cold Chain',
        startDate: '2024-01-15',
        endDate: '2024-07-14',
        value: 520000,
        status: 'Expiring Soon',
        routes: ['UAE - GCC', 'Pharma Routes'],
        sla: '99.5% On-Time',
        rateType: 'Per Container',
        baseRate: 2500,
        renewalStatus: 'Negotiating'
    },
    {
        id: 'CON-2023-012',
        carrier: 'Coast Shipping',
        type: 'Standard',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        value: 150000,
        status: 'Expired',
        routes: ['Dubai - Fujairah'],
        sla: '92% On-Time',
        rateType: 'Per KG',
        baseRate: 8.5,
        renewalStatus: 'Not Renewed'
    },
    {
        id: 'CON-2024-006',
        carrier: 'Heavy Haul Transport',
        type: 'Specialized',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        value: 380000,
        status: 'Active',
        routes: ['Heavy Equipment', 'Oversized Cargo'],
        sla: '97% On-Time',
        rateType: 'Custom Quote',
        baseRate: 0,
        renewalStatus: 'Manual'
    }
];

export default function CarrierContractsPage() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-50 text-green-600 border-green-200';
            case 'Expiring Soon': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'Expired': return 'bg-red-50 text-red-600 border-red-200';
            case 'Pending': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getRenewalColor = (status: string) => {
        switch (status) {
            case 'Auto-Renew': return 'text-green-600';
            case 'Manual': return 'text-blue-600';
            case 'Pending Review': return 'text-yellow-600';
            case 'Negotiating': return 'text-orange-600';
            case 'Not Renewed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const filteredContracts = contracts.filter(contract => {
        if (filter === 'all') return true;
        if (filter === 'active') return contract.status === 'Active';
        if (filter === 'expiring') return contract.status === 'Expiring Soon';
        if (filter === 'expired') return contract.status === 'Expired';
        return true;
    });

    return (
        <div className="p-6 space-y-3 text-sm font-medium">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-8 w-8 text-orange-600" />
                        Carrier Contracts
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
                        Manage carrier agreements, rates, and SLAs
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => exportToCsv('carrier-contracts', filteredContracts)} className="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                        <Plus className="w-4 h-4" /> New Contract
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Contracts</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{contractStats.totalContracts}</p>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</p>
                            <p className="text-2xl font-black text-green-600 mt-1 italic tracking-tighter">{contractStats.active}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Expiring Soon</p>
                            <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter">{contractStats.expiringSoon}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Expired</p>
                            <p className="text-2xl font-black text-red-600 mt-1 italic tracking-tighter">{contractStats.expired}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pending Renewal</p>
                            <p className="text-2xl font-black text-blue-600 mt-1 italic tracking-tighter">{contractStats.pendingRenewal}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Value</p>
                            <p className="text-xl font-black text-white mt-1 italic tracking-tighter">
                                ${(contractStats.totalValue / 1000000).toFixed(2)}M
                            </p>
                        </div>
                        <div className="p-2 bg-gray-800 rounded-lg text-green-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['all', 'active', 'expiring', 'expired'].map((f) => (
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
                            placeholder="Search contracts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-3 py-2">Contract ID</th>
                                <th className="px-3 py-2">Carrier</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Duration</th>
                                <th className="px-3 py-2 text-center">Value</th>
                                <th className="px-3 py-2 text-center">SLA</th>
                                <th className="px-3 py-2 text-center">Rate</th>
                                <th className="px-3 py-2 text-center">Status</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredContracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <td className="px-3 py-2">
                                        <span className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {contract.id}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900">{contract.carrier}</span>
                                                <p className="text-[10px] text-gray-400">{contract.routes.length} routes</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded uppercase">
                                            {contract.type}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="text-[10px]">
                                            <p className="text-gray-600 font-bold">{contract.startDate}</p>
                                            <p className="text-gray-400">to {contract.endDate}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className="font-bold text-gray-900">${contract.value.toLocaleString()}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className="text-[10px] font-black text-blue-600">{contract.sla}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="text-[10px]">
                                            <p className="font-bold text-gray-900">
                                                {contract.baseRate > 0 ? `$${contract.baseRate}` : 'Quote'}
                                            </p>
                                            <p className="text-gray-400">{contract.rateType}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <div>
                                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getStatusColor(contract.status)}`}>
                                                {contract.status}
                                            </span>
                                            <p className={`text-[9px] mt-1 font-bold ${getRenewalColor(contract.renewalStatus)}`}>
                                                {contract.renewalStatus}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                                                <Eye className="w-3 h-3" />
                                            </button>
                                            <button className="p-1.5 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors">
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                                                <MoreVertical className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-start gap-2">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-1">Expiring Soon</h4>
                        <p className="text-[11px] text-yellow-700">
                            Gulf Express and Northern Logistics contracts expire within 90 days. Review and initiate renewal process.
                        </p>
                        <button className="mt-2 text-[10px] font-black text-yellow-800 uppercase tracking-widest flex items-center gap-1 hover:text-yellow-900">
                            Review Contracts <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Rate Review Due</h4>
                        <p className="text-[11px] text-blue-700">
                            Annual rate review is due for 3 contracts. Schedule meetings with carriers to negotiate terms.
                        </p>
                        <button className="mt-2 text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 hover:text-blue-900">
                            Schedule Reviews <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
