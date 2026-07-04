'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Landmark,
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    CheckCircle,
    Clock
} from 'lucide-react';

interface ProfessionalTax {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    state: string;
    grossSalary: number;
    ptAmount: number;
    month: string;
    status: 'Deducted' | 'Pending' | 'Exempted';
}

interface PTSlab {
    state: string;
    slabs: { from: number; to: number; amount: number }[];
    maxAnnual: number;
}

export default function ProfessionalTaxPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January 2025');
    const [stateFilter, setStateFilter] = useState('all');

    const [professionalTaxes, setProfessionalTaxes] = useState<ProfessionalTax[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getStatutoryBy('pt');
                const mapped: ProfessionalTax[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setProfessionalTaxes(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setProfessionalTaxes([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const ptSlabs: PTSlab[] = [
        {
            state: 'Karnataka',
            slabs: [
                { from: 0, to: 15000, amount: 0 },
                { from: 15001, to: 999999999, amount: 200 }
            ],
            maxAnnual: 2400
        },
        {
            state: 'Maharashtra',
            slabs: [
                { from: 0, to: 7500, amount: 0 },
                { from: 7501, to: 10000, amount: 175 },
                { from: 10001, to: 999999999, amount: 200 }
            ],
            maxAnnual: 2500
        }
    ];

    const filteredTaxes = professionalTaxes.filter(pt => {
        const matchesSearch = pt.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pt.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = stateFilter === 'all' || pt.state === stateFilter;
        return matchesSearch && matchesState;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const totalPT = professionalTaxes.filter(pt => pt.status === 'Deducted').reduce((sum, pt) => sum + pt.ptAmount, 0);
    const deductedCount = professionalTaxes.filter(pt => pt.status === 'Deducted').length;
    const exemptedCount = professionalTaxes.filter(pt => pt.status === 'Exempted').length;

    const months = ['January 2025', 'December 2024', 'November 2024', 'October 2024'];
    const states = Array.from(new Set(professionalTaxes.map(pt => pt.state)));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Landmark className="w-8 h-8 text-amber-500" />
                            Professional Tax
                        </h1>
                        <p className="text-gray-400 mt-1">State professional tax deductions</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <p className="text-amber-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">{professionalTaxes.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">PT Deducted</p>
                        <p className="text-3xl font-bold text-white">{deductedCount}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Exempted</p>
                        <p className="text-3xl font-bold text-white">{exemptedCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total PT Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalPT)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">All States</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                        <th className="text-center p-4 text-gray-400 font-medium">State</th>
                                        <th className="text-right p-4 text-gray-400 font-medium">Gross Salary</th>
                                        <th className="text-right p-4 text-gray-400 font-medium">PT Amount</th>
                                        <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTaxes.map((tax) => (
                                        <tr key={tax.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                                        {tax.employeeName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{tax.employeeName}</p>
                                                        <p className="text-xs text-gray-400">{tax.employeeId} • {tax.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-gray-300">{tax.state}</td>
                                            <td className="p-4 text-right text-white">{formatCurrency(tax.grossSalary)}</td>
                                            <td className="p-4 text-right text-amber-400 font-medium">{formatCurrency(tax.ptAmount)}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${tax.status === 'Deducted' ? 'bg-green-500/20 text-green-400' :
                                                        tax.status === 'Exempted' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {tax.status === 'Deducted' && <CheckCircle className="w-3 h-3" />}
                                                    {tax.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                    {tax.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4">PT Slabs - Karnataka</h2>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Up to ₹15,000</span>
                                    <span className="text-green-400 font-medium">Nil</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Above ₹15,000</span>
                                    <span className="text-amber-400 font-medium">₹200/month</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mt-4">
                                <p className="text-amber-400 text-sm font-medium">Maximum Annual PT</p>
                                <p className="text-2xl font-bold text-white">₹2,400</p>
                                <p className="text-xs text-gray-400 mt-1">Capped at ₹200 × 12 months</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Payment Schedule</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>Due by 20th of following month</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
