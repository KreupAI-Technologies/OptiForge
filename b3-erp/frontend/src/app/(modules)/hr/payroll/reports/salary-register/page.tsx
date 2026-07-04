'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Table,
    Search,
    Filter,
    Download,
    Calendar,
    Users,
    DollarSign,
    Building
} from 'lucide-react';

interface SalaryRegisterEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    basicSalary: number;
    hra: number;
    conveyance: number;
    specialAllowance: number;
    otherAllowances: number;
    grossEarnings: number;
    pf: number;
    esi: number;
    professionalTax: number;
    tds: number;
    otherDeductions: number;
    totalDeductions: number;
    netPay: number;
    workingDays: number;
    lopDays: number;
    paidDays: number;
}

export default function SalaryRegisterPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January');
    const [yearFilter, setYearFilter] = useState('2025');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const entries: SalaryRegisterEntry[] = [
        {
            id: '1',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            designation: 'HR Manager',
            basicSalary: 68750,
            hra: 27500,
            conveyance: 3000,
            specialAllowance: 25000,
            otherAllowances: 13250,
            grossEarnings: 137500,
            pf: 8250,
            esi: 0,
            professionalTax: 200,
            tds: 22000,
            otherDeductions: 4550,
            totalDeductions: 35000,
            netPay: 102500,
            workingDays: 26,
            lopDays: 0,
            paidDays: 26
        },
        {
            id: '2',
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            designation: 'Senior Production Engineer',
            basicSalary: 38333,
            hra: 15333,
            conveyance: 1600,
            specialAllowance: 14000,
            otherAllowances: 7400,
            grossEarnings: 76667,
            pf: 4600,
            esi: 575,
            professionalTax: 200,
            tds: 8000,
            otherDeductions: 4625,
            totalDeductions: 18000,
            netPay: 58667,
            workingDays: 26,
            lopDays: 1,
            paidDays: 25
        },
        {
            id: '3',
            employeeId: 'EMP003',
            employeeName: 'Emily Davis',
            department: 'Quality Assurance',
            designation: 'QA Analyst',
            basicSalary: 33750,
            hra: 13500,
            conveyance: 1600,
            specialAllowance: 12000,
            otherAllowances: 6650,
            grossEarnings: 67500,
            pf: 4050,
            esi: 506,
            professionalTax: 200,
            tds: 6000,
            otherDeductions: 4244,
            totalDeductions: 15000,
            netPay: 52500,
            workingDays: 26,
            lopDays: 0,
            paidDays: 26
        },
        {
            id: '4',
            employeeId: 'EMP005',
            employeeName: 'Jennifer Brown',
            department: 'Finance',
            designation: 'Senior Accountant',
            basicSalary: 55000,
            hra: 22000,
            conveyance: 2400,
            specialAllowance: 20000,
            otherAllowances: 10600,
            grossEarnings: 110000,
            pf: 6600,
            esi: 0,
            professionalTax: 200,
            tds: 16000,
            otherDeductions: 5200,
            totalDeductions: 28000,
            netPay: 82000,
            workingDays: 26,
            lopDays: 0,
            paidDays: 26
        },
        {
            id: '5',
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            designation: 'Software Developer',
            basicSalary: 45000,
            hra: 18000,
            conveyance: 1600,
            specialAllowance: 16000,
            otherAllowances: 9400,
            grossEarnings: 90000,
            pf: 5400,
            esi: 0,
            professionalTax: 200,
            tds: 12000,
            otherDeductions: 4400,
            totalDeductions: 22000,
            netPay: 68000,
            workingDays: 26,
            lopDays: 0,
            paidDays: 26
        }
    ];

    const departments = Array.from(new Set(entries.map(e => e.department)));

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || entry.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const totals = filteredEntries.reduce((acc, entry) => ({
        grossEarnings: acc.grossEarnings + entry.grossEarnings,
        totalDeductions: acc.totalDeductions + entry.totalDeductions,
        netPay: acc.netPay + entry.netPay,
        pf: acc.pf + entry.pf,
        tds: acc.tds + entry.tds
    }), { grossEarnings: 0, totalDeductions: 0, netPay: 0, pf: 0, tds: 0 });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Table className="w-8 h-8 text-green-500" />
                            Salary Register
                        </h1>
                        <p className="text-gray-400 mt-1">Comprehensive salary details for all employees</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Employees</p>
                        <p className="text-2xl font-bold text-white">{filteredEntries.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Gross Earnings</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.grossEarnings)}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Deductions</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.totalDeductions)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Net Pay</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.netPay)}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">PF + TDS</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.pf + totals.tds)}</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 bg-gray-900/50">
                                    <th className="text-left p-3 text-gray-400 font-medium sticky left-0 bg-gray-900">Employee</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Basic</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">HRA</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Conv.</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Special</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Other</th>
                                    <th className="text-right p-3 text-green-400 font-medium">Gross</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">PF</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">ESI</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">PT</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">TDS</th>
                                    <th className="text-right p-3 text-red-400 font-medium">Ded.</th>
                                    <th className="text-right p-3 text-blue-400 font-medium">Net Pay</th>
                                    <th className="text-center p-3 text-gray-400 font-medium">Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-3 sticky left-0 bg-gray-800/90">
                                            <p className="text-white font-medium">{entry.employeeName}</p>
                                            <p className="text-xs text-gray-400">{entry.employeeId}</p>
                                        </td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.basicSalary)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.hra)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.conveyance)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.specialAllowance)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.otherAllowances)}</td>
                                        <td className="p-3 text-right text-green-400 font-medium">{formatCurrency(entry.grossEarnings)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.pf)}</td>
                                        <td className="p-3 text-right text-gray-300">{entry.esi > 0 ? formatCurrency(entry.esi) : '-'}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.professionalTax)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.tds)}</td>
                                        <td className="p-3 text-right text-red-400 font-medium">{formatCurrency(entry.totalDeductions)}</td>
                                        <td className="p-3 text-right text-blue-400 font-medium">{formatCurrency(entry.netPay)}</td>
                                        <td className="p-3 text-center text-gray-300">
                                            {entry.paidDays}/{entry.workingDays}
                                            {entry.lopDays > 0 && <span className="text-red-400 text-xs ml-1">(-{entry.lopDays})</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-900/50 border-t border-gray-600">
                                    <td className="p-3 text-white font-bold sticky left-0 bg-gray-900">Total</td>
                                    <td colSpan={5} className="p-3"></td>
                                    <td className="p-3 text-right text-green-400 font-bold">{formatCurrency(totals.grossEarnings)}</td>
                                    <td colSpan={4} className="p-3"></td>
                                    <td className="p-3 text-right text-red-400 font-bold">{formatCurrency(totals.totalDeductions)}</td>
                                    <td className="p-3 text-right text-blue-400 font-bold">{formatCurrency(totals.netPay)}</td>
                                    <td className="p-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
