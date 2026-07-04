'use client';

import React, { useState, useEffect } from 'react';
import {
    UserMinus,
    Plus,
    Search,
    Filter,
    Download,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    MoreVertical
} from 'lucide-react';

interface Separation {
    id: string;
    employeeId: string;
    employeeName: string;
    designation: string;
    department: string;
    separationType: 'Resignation' | 'Termination' | 'Retirement' | 'End of Contract';
    initiationDate: string;
    lastWorkingDay: string;
    noticePeriod: number;
    status: 'Initiated' | 'In Progress' | 'Pending Clearance' | 'Completed';
    exitInterviewScheduled: boolean;
    clearanceStatus: number;
}

export default function SeparationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const separations: Separation[] = [
        {
            id: '1',
            employeeId: 'EMP045',
            employeeName: 'Jessica Brown',
            designation: 'Procurement Specialist',
            department: 'Procurement',
            separationType: 'Resignation',
            initiationDate: '2025-01-15',
            lastWorkingDay: '2025-02-15',
            noticePeriod: 30,
            status: 'In Progress',
            exitInterviewScheduled: true,
            clearanceStatus: 60
        },
        {
            id: '2',
            employeeId: 'EMP078',
            employeeName: 'Thomas Anderson',
            designation: 'Warehouse Associate',
            department: 'Warehouse',
            separationType: 'Termination',
            initiationDate: '2025-01-20',
            lastWorkingDay: '2025-01-27',
            noticePeriod: 7,
            status: 'Pending Clearance',
            exitInterviewScheduled: false,
            clearanceStatus: 80
        },
        {
            id: '3',
            employeeId: 'EMP012',
            employeeName: 'Rachel Green',
            designation: 'Marketing Manager',
            department: 'Marketing',
            separationType: 'Retirement',
            initiationDate: '2024-12-01',
            lastWorkingDay: '2025-01-31',
            noticePeriod: 60,
            status: 'Completed',
            exitInterviewScheduled: true,
            clearanceStatus: 100
        },
        {
            id: '4',
            employeeId: 'CON015',
            employeeName: 'Kevin Ross',
            designation: 'IT Consultant',
            department: 'IT',
            separationType: 'End of Contract',
            initiationDate: '2025-01-01',
            lastWorkingDay: '2025-01-31',
            noticePeriod: 0,
            status: 'Initiated',
            exitInterviewScheduled: false,
            clearanceStatus: 20
        }
    ];

    const filteredSeparations = separations.filter(sep => {
        const matchesSearch = sep.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sep.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sep.status === statusFilter;
        const matchesType = typeFilter === 'all' || sep.separationType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-400';
            case 'In Progress': return 'bg-blue-500/20 text-blue-400';
            case 'Pending Clearance': return 'bg-yellow-500/20 text-yellow-400';
            case 'Initiated': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Resignation': return 'bg-yellow-500/20 text-yellow-400';
            case 'Termination': return 'bg-red-500/20 text-red-400';
            case 'Retirement': return 'bg-blue-500/20 text-blue-400';
            case 'End of Contract': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-blue-400" />;
            case 'Pending Clearance': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <UserMinus className="w-8 h-8 text-red-500" />
                            Separations
                        </h1>
                        <p className="text-gray-400 mt-1">Manage employee exits and clearances</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            Initiate Separation
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Separations</p>
                        <p className="text-3xl font-bold text-white">{separations.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">In Progress</p>
                        <p className="text-3xl font-bold text-white">{separations.filter(s => s.status === 'In Progress').length}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Pending Clearance</p>
                        <p className="text-3xl font-bold text-white">{separations.filter(s => s.status === 'Pending Clearance').length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Completed This Month</p>
                        <p className="text-3xl font-bold text-white">{separations.filter(s => s.status === 'Completed').length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Initiated">Initiated</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending Clearance">Pending Clearance</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Resignation">Resignation</option>
                            <option value="Termination">Termination</option>
                            <option value="Retirement">Retirement</option>
                            <option value="End of Contract">End of Contract</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredSeparations.map((sep) => (
                        <div key={sep.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                                        {sep.employeeName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-semibold text-white">{sep.employeeName}</h3>
                                            <span className="text-xs text-gray-500 font-mono">{sep.employeeId}</span>
                                        </div>
                                        <p className="text-gray-400">{sep.designation} • {sep.department}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(sep.separationType)}`}>
                                        {sep.separationType}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(sep.status)}`}>
                                        {getStatusIcon(sep.status)}
                                        {sep.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500">Initiation Date</p>
                                    <p className="text-sm text-white flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        {new Date(sep.initiationDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Working Day</p>
                                    <p className="text-sm text-white flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        {new Date(sep.lastWorkingDay).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Notice Period</p>
                                    <p className="text-sm text-white">{sep.noticePeriod} days</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Exit Interview</p>
                                    <p className={`text-sm ${sep.exitInterviewScheduled ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {sep.exitInterviewScheduled ? 'Scheduled' : 'Not Scheduled'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Clearance Progress</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${sep.clearanceStatus === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${sep.clearanceStatus}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-white">{sep.clearanceStatus}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                    <FileText className="w-4 h-4" /> View Details
                                </button>
                                {sep.status !== 'Completed' && (
                                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                                        <CheckCircle className="w-4 h-4" /> Update Clearance
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
