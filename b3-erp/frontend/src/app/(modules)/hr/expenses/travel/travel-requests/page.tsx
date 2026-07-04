'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Plane,
    Search,
    Filter,
    Download,
    PlusCircle,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    MapPin,
    Users,
    Edit
} from 'lucide-react';

interface TravelRequest {
    id: string;
    requestId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    purpose: string;
    travelType: 'Domestic' | 'International';
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    returnDate: string;
    estimatedCost: number;
    status: 'Draft' | 'Submitted' | 'Manager Approved' | 'HR Approved' | 'Rejected' | 'Cancelled';
    approvalLevel: string;
    travelers: number;
    accommodation: boolean;
    transport: string[];
}

export default function TravelRequestsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const requests: TravelRequest[] = [
        {
            id: '1',
            requestId: 'TR-2025-001',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            purpose: 'Annual HR Conference 2025',
            travelType: 'Domestic',
            fromLocation: 'Bangalore',
            toLocation: 'Mumbai',
            departureDate: '2025-02-20',
            returnDate: '2025-02-23',
            estimatedCost: 75000,
            status: 'HR Approved',
            approvalLevel: 'All approvals complete',
            travelers: 1,
            accommodation: true,
            transport: ['Flight', 'Cab']
        },
        {
            id: '2',
            requestId: 'TR-2025-002',
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            purpose: 'Factory Audit - Chennai Plant',
            travelType: 'Domestic',
            fromLocation: 'Bangalore',
            toLocation: 'Chennai',
            departureDate: '2025-02-25',
            returnDate: '2025-02-26',
            estimatedCost: 25000,
            status: 'Manager Approved',
            approvalLevel: 'Pending HR approval',
            travelers: 2,
            accommodation: true,
            transport: ['Flight', 'Cab']
        },
        {
            id: '3',
            requestId: 'TR-2025-003',
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            purpose: 'Tech Summit Singapore',
            travelType: 'International',
            fromLocation: 'Bangalore',
            toLocation: 'Singapore',
            departureDate: '2025-03-10',
            returnDate: '2025-03-15',
            estimatedCost: 250000,
            status: 'Submitted',
            approvalLevel: 'Pending manager approval',
            travelers: 1,
            accommodation: true,
            transport: ['Flight', 'Cab']
        },
        {
            id: '4',
            requestId: 'TR-2025-004',
            employeeId: 'EMP010',
            employeeName: 'Priya Sharma',
            department: 'Sales',
            purpose: 'Client Meeting - Delhi',
            travelType: 'Domestic',
            fromLocation: 'Bangalore',
            toLocation: 'Delhi',
            departureDate: '2025-02-18',
            returnDate: '2025-02-19',
            estimatedCost: 35000,
            status: 'HR Approved',
            approvalLevel: 'All approvals complete',
            travelers: 1,
            accommodation: true,
            transport: ['Flight', 'Cab']
        },
        {
            id: '5',
            requestId: 'TR-2025-005',
            employeeId: 'EMP003',
            employeeName: 'Emily Davis',
            department: 'Quality Assurance',
            purpose: 'Quality Training Program',
            travelType: 'Domestic',
            fromLocation: 'Bangalore',
            toLocation: 'Pune',
            departureDate: '2025-03-01',
            returnDate: '2025-03-05',
            estimatedCost: 55000,
            status: 'Rejected',
            approvalLevel: 'Rejected by manager',
            travelers: 1,
            accommodation: true,
            transport: ['Train', 'Cab']
        },
        {
            id: '6',
            requestId: 'TR-2025-006',
            employeeId: 'EMP008',
            employeeName: 'David Wilson',
            department: 'Production',
            purpose: 'Vendor Visit - Hyderabad',
            travelType: 'Domestic',
            fromLocation: 'Bangalore',
            toLocation: 'Hyderabad',
            departureDate: '2025-02-28',
            returnDate: '2025-02-28',
            estimatedCost: 8000,
            status: 'Draft',
            approvalLevel: 'Not submitted',
            travelers: 1,
            accommodation: false,
            transport: ['Train']
        }
    ];

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesType = typeFilter === 'all' || request.travelType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HR Approved': return 'bg-green-500/20 text-green-400';
            case 'Manager Approved': return 'bg-blue-500/20 text-blue-400';
            case 'Submitted': return 'bg-yellow-500/20 text-yellow-400';
            case 'Draft': return 'bg-gray-500/20 text-gray-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            case 'Cancelled': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'HR Approved': return <CheckCircle className="w-4 h-4" />;
            case 'Manager Approved': return <Clock className="w-4 h-4" />;
            case 'Submitted': return <Clock className="w-4 h-4" />;
            case 'Draft': return <Edit className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const approvedCount = requests.filter(r => r.status === 'HR Approved' || r.status === 'Manager Approved').length;
    const pendingCount = requests.filter(r => r.status === 'Submitted').length;
    const totalEstimatedCost = requests.filter(r => r.status !== 'Rejected' && r.status !== 'Cancelled').reduce((sum, r) => sum + r.estimatedCost, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Plane className="w-8 h-8 text-blue-500" />
                            Travel Requests
                        </h1>
                        <p className="text-gray-400 mt-1">Create and manage travel authorization requests</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            New Request
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Requests</p>
                        <p className="text-3xl font-bold text-white">{requests.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Approved</p>
                        <p className="text-3xl font-bold text-white">{approvedCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Approval</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Estimated Cost</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalEstimatedCost)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search travel requests..."
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
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Manager Approved">Manager Approved</option>
                            <option value="HR Approved">HR Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Domestic">Domestic</option>
                            <option value="International">International</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Travel Details</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Route</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Dates</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Est. Cost</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                                                    {request.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{request.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{request.employeeId} • {request.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{request.purpose}</p>
                                                <p className="text-xs text-gray-400">{request.requestId} • {request.travelType}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {request.travelers > 1 && (
                                                        <span className="flex items-center gap-1 text-xs text-blue-400">
                                                            <Users className="w-3 h-3" />
                                                            {request.travelers}
                                                        </span>
                                                    )}
                                                    {request.transport.map((t, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-white">{request.fromLocation}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-white">{request.toLocation}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-white">{new Date(request.departureDate).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-400">to {new Date(request.returnDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-white font-medium">{formatCurrency(request.estimatedCost)}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">{request.approvalLevel}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {request.status === 'Draft' && (
                                                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {request.status === 'HR Approved' && (
                                                    <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded" title="Book Travel">
                                                        <Plane className="w-4 h-4" />
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
