'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Building,
    Search,
    Filter,
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    PieChart
} from 'lucide-react';

interface DepartmentCost {
    id: string;
    department: string;
    headCount: number;
    grossSalary: number;
    allowances: number;
    bonus: number;
    benefits: number;
    totalCost: number;
    avgCostPerEmployee: number;
    percentageOfTotal: number;
    previousMonthCost: number;
    variance: number;
    variancePercentage: number;
}

export default function DepartmentCostPage() {
    const [monthFilter, setMonthFilter] = useState('January');
    const [yearFilter, setYearFilter] = useState('2025');

    const departmentCosts: DepartmentCost[] = [
        {
            id: '1',
            department: 'Human Resources',
            headCount: 8,
            grossSalary: 850000,
            allowances: 170000,
            bonus: 68000,
            benefits: 102000,
            totalCost: 1190000,
            avgCostPerEmployee: 148750,
            percentageOfTotal: 15.8,
            previousMonthCost: 1150000,
            variance: 40000,
            variancePercentage: 3.5
        },
        {
            id: '2',
            department: 'Production',
            headCount: 45,
            grossSalary: 2700000,
            allowances: 540000,
            bonus: 135000,
            benefits: 324000,
            totalCost: 3699000,
            avgCostPerEmployee: 82200,
            percentageOfTotal: 49.2,
            previousMonthCost: 3600000,
            variance: 99000,
            variancePercentage: 2.75
        },
        {
            id: '3',
            department: 'Quality Assurance',
            headCount: 12,
            grossSalary: 720000,
            allowances: 144000,
            bonus: 57600,
            benefits: 86400,
            totalCost: 1008000,
            avgCostPerEmployee: 84000,
            percentageOfTotal: 13.4,
            previousMonthCost: 1020000,
            variance: -12000,
            variancePercentage: -1.2
        },
        {
            id: '4',
            department: 'Finance',
            headCount: 6,
            grossSalary: 540000,
            allowances: 108000,
            bonus: 43200,
            benefits: 64800,
            totalCost: 756000,
            avgCostPerEmployee: 126000,
            percentageOfTotal: 10.1,
            previousMonthCost: 740000,
            variance: 16000,
            variancePercentage: 2.2
        },
        {
            id: '5',
            department: 'IT',
            headCount: 10,
            grossSalary: 680000,
            allowances: 136000,
            bonus: 54400,
            benefits: 81600,
            totalCost: 952000,
            avgCostPerEmployee: 95200,
            percentageOfTotal: 12.7,
            previousMonthCost: 920000,
            variance: 32000,
            variancePercentage: 3.5
        }
    ];

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)}Cr`;
        }
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const totalCost = departmentCosts.reduce((sum, d) => sum + d.totalCost, 0);
    const totalHeadCount = departmentCosts.reduce((sum, d) => sum + d.headCount, 0);
    const totalVariance = departmentCosts.reduce((sum, d) => sum + d.variance, 0);
    const avgCostPerEmployee = totalCost / totalHeadCount;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Building className="w-8 h-8 text-cyan-500" />
                            Department Cost
                        </h1>
                        <p className="text-gray-400 mt-1">Analyze payroll costs by department</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-400 text-sm">Total Payroll Cost</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalCost)}</p>
                        <p className="text-xs text-gray-400 mt-1">{monthFilter} {yearFilter}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">{totalHeadCount}</p>
                        <p className="text-xs text-gray-400 mt-1">{departmentCosts.length} departments</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Avg. Cost/Employee</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(avgCostPerEmployee)}</p>
                    </div>
                    <div className={`${totalVariance >= 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-xl p-4`}>
                        <p className={`${totalVariance >= 0 ? 'text-red-400' : 'text-green-400'} text-sm`}>MoM Variance</p>
                        <p className="text-3xl font-bold text-white flex items-center gap-2">
                            {totalVariance >= 0 ? <TrendingUp className="w-6 h-6 text-red-400" /> : <TrendingDown className="w-6 h-6 text-green-400" />}
                            {formatCurrency(Math.abs(totalVariance))}
                        </p>
                    </div>
                </div>

                {/* Cost Distribution Chart Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-cyan-400" />
                            Cost Distribution by Department
                        </h3>
                        <div className="space-y-3">
                            {departmentCosts.map((dept) => (
                                <div key={dept.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-300">{dept.department}</span>
                                        <span className="text-white font-medium">{formatCurrency(dept.totalCost)} ({dept.percentageOfTotal}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                                            style={{ width: `${dept.percentageOfTotal}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Gross Salary</span>
                                <span className="text-white font-medium">{formatCurrency(departmentCosts.reduce((sum, d) => sum + d.grossSalary, 0))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Allowances</span>
                                <span className="text-white font-medium">{formatCurrency(departmentCosts.reduce((sum, d) => sum + d.allowances, 0))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Bonus</span>
                                <span className="text-white font-medium">{formatCurrency(departmentCosts.reduce((sum, d) => sum + d.bonus, 0))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Benefits</span>
                                <span className="text-white font-medium">{formatCurrency(departmentCosts.reduce((sum, d) => sum + d.benefits, 0))}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                                <span className="text-white font-semibold">Total</span>
                                <span className="text-cyan-400 font-bold">{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Head Count</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Gross Salary</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Allowances</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Bonus</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Benefits</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Total Cost</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Avg/Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">MoM Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentCosts.map((dept) => (
                                    <tr key={dept.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {dept.department.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{dept.department}</p>
                                                    <p className="text-xs text-gray-400">{dept.percentageOfTotal}% of total</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="flex items-center justify-center gap-1 text-white">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                {dept.headCount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(dept.grossSalary)}</td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(dept.allowances)}</td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(dept.bonus)}</td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(dept.benefits)}</td>
                                        <td className="p-4 text-right text-cyan-400 font-medium">{formatCurrency(dept.totalCost)}</td>
                                        <td className="p-4 text-right text-white">{formatCurrency(dept.avgCostPerEmployee)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${dept.variance >= 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {dept.variance >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {dept.variancePercentage >= 0 ? '+' : ''}{dept.variancePercentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-900/50 border-t border-gray-600">
                                    <td className="p-4 text-white font-bold">Total</td>
                                    <td className="p-4 text-center text-white font-bold">{totalHeadCount}</td>
                                    <td className="p-4 text-right text-white font-bold">{formatCurrency(departmentCosts.reduce((s, d) => s + d.grossSalary, 0))}</td>
                                    <td className="p-4 text-right text-white font-bold">{formatCurrency(departmentCosts.reduce((s, d) => s + d.allowances, 0))}</td>
                                    <td className="p-4 text-right text-white font-bold">{formatCurrency(departmentCosts.reduce((s, d) => s + d.bonus, 0))}</td>
                                    <td className="p-4 text-right text-white font-bold">{formatCurrency(departmentCosts.reduce((s, d) => s + d.benefits, 0))}</td>
                                    <td className="p-4 text-right text-cyan-400 font-bold">{formatCurrency(totalCost)}</td>
                                    <td className="p-4 text-right text-white font-bold">{formatCurrency(avgCostPerEmployee)}</td>
                                    <td className="p-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
