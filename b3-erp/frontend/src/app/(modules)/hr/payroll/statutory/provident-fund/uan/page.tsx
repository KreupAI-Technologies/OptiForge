'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    CreditCard,
    Search,
    Filter,
    Download,
    Edit,
    CheckCircle,
    AlertCircle,
    Clock,
    UserPlus,
    Link,
    Eye
} from 'lucide-react';

interface UANRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    uan: string;
    memberId: string;
    dateOfJoining: string;
    dateOfBirth: string;
    aadhar: string;
    pan: string;
    bankAccount: string;
    kycStatus: 'Verified' | 'Pending' | 'Partial';
    uanStatus: 'Active' | 'Inactive' | 'Pending Activation';
}

export default function UANManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [uanRecords, setUanRecords] = useState<UANRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getStatutoryBy('pf-uan');
                const mapped: UANRecord[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setUanRecords(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setUanRecords([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredRecords = uanRecords.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.uan.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' ||
            record.uanStatus === statusFilter ||
            record.kycStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getKYCStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-green-500/20 text-green-400';
            case 'Partial': return 'bg-yellow-500/20 text-yellow-400';
            case 'Pending': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getUANStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'Inactive': return 'bg-red-500/20 text-red-400';
            case 'Pending Activation': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const activeCount = uanRecords.filter(r => r.uanStatus === 'Active').length;
    const pendingCount = uanRecords.filter(r => r.uanStatus === 'Pending Activation').length;
    const verifiedKYC = uanRecords.filter(r => r.kycStatus === 'Verified').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-green-500" />
                            UAN Management
                        </h1>
                        <p className="text-gray-400 mt-1">Manage Universal Account Numbers and KYC</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <UserPlus className="w-4 h-4" />
                            Register New
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Active UAN</p>
                        <p className="text-3xl font-bold text-white">{activeCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Activation</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">KYC Verified</p>
                        <p className="text-3xl font-bold text-white">{verifiedKYC}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Members</p>
                        <p className="text-3xl font-bold text-white">{uanRecords.length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or UAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active UAN</option>
                            <option value="Pending Activation">Pending Activation</option>
                            <option value="Verified">KYC Verified</option>
                            <option value="Partial">KYC Partial</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">UAN</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Member ID</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">DOJ</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Aadhar</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">KYC Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">UAN Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{record.employeeId} • {record.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {record.uan ? (
                                                <span className="font-mono text-gray-300">{record.uan}</span>
                                            ) : (
                                                <span className="text-gray-500">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {record.memberId ? (
                                                <span className="font-mono text-xs text-gray-300">{record.memberId}</span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center text-gray-300 text-sm">
                                            {new Date(record.dateOfJoining).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-mono text-xs text-gray-300">{record.aadhar}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getKYCStatusColor(record.kycStatus)}`}>
                                                {record.kycStatus === 'Verified' && <CheckCircle className="w-3 h-3" />}
                                                {record.kycStatus === 'Partial' && <Clock className="w-3 h-3" />}
                                                {record.kycStatus === 'Pending' && <AlertCircle className="w-3 h-3" />}
                                                {record.kycStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${getUANStatusColor(record.uanStatus)}`}>
                                                {record.uanStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {record.uanStatus === 'Pending Activation' && (
                                                    <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded">
                                                        <Link className="w-4 h-4" />
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
            </div>
        </div>
    );
}
