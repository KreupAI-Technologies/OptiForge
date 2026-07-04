'use client';

import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User
} from 'lucide-react';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface CompOffBalance {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    earnedHours: number;
    usedHours: number;
    balanceHours: number;
    expiringHours: number;
    expiryDate: string | null;
}

interface CompOffRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    requestDate: string;
    compOffDate: string;
    hours: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
}

export default function CompOffPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState<'balance' | 'requests'>('balance');

    const balances: CompOffBalance[] = [
        { id: '1', employeeId: 'EMP002', employeeName: 'Michael Chen', department: 'Production', earnedHours: 24, usedHours: 8, balanceHours: 16, expiringHours: 8, expiryDate: '2025-03-31' },
        { id: '2', employeeId: 'EMP003', employeeName: 'Emily Davis', department: 'Quality Assurance', earnedHours: 12, usedHours: 4, balanceHours: 8, expiringHours: 0, expiryDate: null },
        { id: '3', employeeId: 'EMP006', employeeName: 'Robert Martinez', department: 'IT', earnedHours: 16, usedHours: 0, balanceHours: 16, expiringHours: 8, expiryDate: '2025-02-28' },
        { id: '4', employeeId: 'EMP008', employeeName: 'James Taylor', department: 'Warehouse', earnedHours: 20, usedHours: 12, balanceHours: 8, expiringHours: 0, expiryDate: null },
        { id: '5', employeeId: 'EMP009', employeeName: 'Anna Martin', department: 'Quality Assurance', earnedHours: 8, usedHours: 0, balanceHours: 8, expiringHours: 8, expiryDate: '2025-04-15' }
    ];

    const requests: CompOffRequest[] = [
        { id: '1', employeeId: 'EMP002', employeeName: 'Michael Chen', department: 'Production', requestDate: '2025-01-28', compOffDate: '2025-02-10', hours: 8, reason: 'Family function', status: 'Pending' },
        { id: '2', employeeId: 'EMP006', employeeName: 'Robert Martinez', department: 'IT', requestDate: '2025-01-25', compOffDate: '2025-02-05', hours: 8, reason: 'Personal work', status: 'Approved', approvedBy: 'IT Manager' },
        { id: '3', employeeId: 'EMP003', employeeName: 'Emily Davis', department: 'Quality Assurance', requestDate: '2025-01-20', compOffDate: '2025-01-30', hours: 4, reason: 'Medical appointment', status: 'Approved', approvedBy: 'QA Manager' },
        { id: '4', employeeId: 'EMP008', employeeName: 'James Taylor', department: 'Warehouse', requestDate: '2025-01-30', compOffDate: '2025-02-12', hours: 8, reason: 'Travel plans', status: 'Pending' }
    ];

    const filteredBalances = balances.filter(b =>
        b.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequests = requests.filter(r =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStats = {
        totalEarned: balances.reduce((sum, b) => sum + b.earnedHours, 0),
        totalUsed: balances.reduce((sum, b) => sum + b.usedHours, 0),
        totalBalance: balances.reduce((sum, b) => sum + b.balanceHours, 0),
        expiringThisMonth: balances.reduce((sum, b) => sum + b.expiringHours, 0)
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <CalendarCheck className="w-8 h-8 text-purple-500" />
                            Comp-Off Management
                        </h1>
                        <p className="text-gray-400 mt-1">Manage compensatory off balances and requests</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        Request Comp-Off
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total Earned</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalEarned}h</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Used</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalUsed}h</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Available Balance</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalBalance}h</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-red-400 text-sm">Expiring Soon</p>
                            <p className="text-xl font-bold text-white">{totalStats.expiringThisMonth}h</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewType('balance')}
                            className={`px-4 py-2 rounded-lg text-sm ${viewType === 'balance' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Balances
                        </button>
                        <button
                            onClick={() => setViewType('requests')}
                            className={`px-4 py-2 rounded-lg text-sm ${viewType === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Requests
                        </button>
                    </div>
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {viewType === 'balance' ? (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Earned</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Used</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Balance</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Expiring</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBalances.map((balance) => (
                                    <tr key={balance.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                    {balance.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{balance.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{balance.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{balance.department}</td>
                                        <td className="p-4 text-center text-green-400 font-medium">{balance.earnedHours}h</td>
                                        <td className="p-4 text-center text-blue-400 font-medium">{balance.usedHours}h</td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-medium">
                                                {balance.balanceHours}h
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {balance.expiringHours > 0 ? (
                                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-medium">
                                                    {balance.expiringHours}h
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {balance.expiryDate ? new Date(balance.expiryDate).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                            {request.employeeName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white">{request.employeeName}</h3>
                                                <span className="text-xs text-gray-500 font-mono">{request.employeeId}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{request.department}</p>

                                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    Comp-Off: {new Date(request.compOffDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    {request.hours}h
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-400">Reason: {request.reason}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                                        </p>
                                        {request.approvedBy && (
                                            <p className="text-xs text-gray-500">Approved by {request.approvedBy}</p>
                                        )}

                                        {request.status === 'Pending' && (
                                            <div className="flex gap-2 mt-2">
                                                <button className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
