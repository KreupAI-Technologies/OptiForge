'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Calculator,
    Search,
    Filter,
    Download,
    Eye,
    FileText,
    TrendingUp,
    Calendar,
    Users
} from 'lucide-react';

interface TDSCalculation {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    pan: string;
    regime: 'Old' | 'New';
    grossIncome: number;
    exemptions: number;
    deductions: number;
    taxableIncome: number;
    taxLiability: number;
    tdsDeducted: number;
    tdsBalance: number;
    monthlyTDS: number;
}

export default function TDSCalculationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [regimeFilter, setRegimeFilter] = useState('all');
    const [fiscalYear] = useState('2024-25');

    const calculations: TDSCalculation[] = [
        {
            id: '1',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            pan: 'ABCPJ1234K',
            regime: 'Old',
            grossIncome: 1500000,
            exemptions: 200000,
            deductions: 250000,
            taxableIncome: 1050000,
            taxLiability: 115500,
            tdsDeducted: 86625,
            tdsBalance: 28875,
            monthlyTDS: 9625
        },
        {
            id: '2',
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            pan: 'DEFPC5678L',
            regime: 'New',
            grossIncome: 800000,
            exemptions: 0,
            deductions: 50000,
            taxableIncome: 750000,
            taxLiability: 35000,
            tdsDeducted: 26250,
            tdsBalance: 8750,
            monthlyTDS: 2917
        },
        {
            id: '3',
            employeeId: 'EMP003',
            employeeName: 'Emily Davis',
            department: 'Quality Assurance',
            pan: 'GHIPD9012M',
            regime: 'Old',
            grossIncome: 750000,
            exemptions: 100000,
            deductions: 150000,
            taxableIncome: 500000,
            taxLiability: 12500,
            tdsDeducted: 9375,
            tdsBalance: 3125,
            monthlyTDS: 1042
        },
        {
            id: '4',
            employeeId: 'EMP005',
            employeeName: 'Jennifer Brown',
            department: 'Finance',
            pan: 'JKLPB3456N',
            regime: 'Old',
            grossIncome: 1200000,
            exemptions: 150000,
            deductions: 200000,
            taxableIncome: 850000,
            taxLiability: 72500,
            tdsDeducted: 54375,
            tdsBalance: 18125,
            monthlyTDS: 6042
        },
        {
            id: '5',
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            pan: 'MNOPB7890O',
            regime: 'New',
            grossIncome: 900000,
            exemptions: 0,
            deductions: 50000,
            taxableIncome: 850000,
            taxLiability: 52500,
            tdsDeducted: 39375,
            tdsBalance: 13125,
            monthlyTDS: 4375
        }
    ];

    const filteredCalculations = calculations.filter(calc => {
        const matchesSearch = calc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            calc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            calc.pan.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegime = regimeFilter === 'all' || calc.regime === regimeFilter;
        return matchesSearch && matchesRegime;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const totalTaxLiability = calculations.reduce((sum, c) => sum + c.taxLiability, 0);
    const totalTDSDeducted = calculations.reduce((sum, c) => sum + c.tdsDeducted, 0);
    const totalBalance = calculations.reduce((sum, c) => sum + c.tdsBalance, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calculator className="w-8 h-8 text-orange-500" />
                            TDS Calculation
                        </h1>
                        <p className="text-gray-400 mt-1">Calculate and manage Tax Deducted at Source</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm">
                            FY {fiscalYear}
                        </span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Tax Liability</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalTaxLiability)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">TDS Deducted (YTD)</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalTDSDeducted)}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Balance to Deduct</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalBalance)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Employees with TDS</p>
                        <p className="text-3xl font-bold text-white">{calculations.filter(c => c.taxLiability > 0).length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or PAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={regimeFilter}
                            onChange={(e) => setRegimeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Regimes</option>
                            <option value="Old">Old Regime</option>
                            <option value="New">New Regime</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">PAN</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Regime</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Gross Income</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Taxable</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Tax Liability</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">TDS Deducted</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Monthly TDS</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCalculations.map((calc) => (
                                    <tr key={calc.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                                                    {calc.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{calc.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{calc.employeeId} • {calc.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-mono text-gray-300">{calc.pan}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${calc.regime === 'Old' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {calc.regime}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-white">{formatCurrency(calc.grossIncome)}</td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(calc.taxableIncome)}</td>
                                        <td className="p-4 text-right text-orange-400 font-medium">{formatCurrency(calc.taxLiability)}</td>
                                        <td className="p-4 text-right text-green-400">{formatCurrency(calc.tdsDeducted)}</td>
                                        <td className="p-4 text-right text-yellow-400">{formatCurrency(calc.monthlyTDS)}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <FileText className="w-4 h-4" />
                                                </button>
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
