'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Filter,
    Calendar,
    Clock,
    Users,
    TrendingUp,
    DollarSign,
    FileText,
    Printer
} from 'lucide-react';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface OvertimeReport {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    totalHours: number;
    paidHours: number;
    compOffHours: number;
    totalAmount: number;
    month: string;
}

interface DepartmentSummary {
    department: string;
    totalHours: number;
    totalEmployees: number;
    totalCost: number;
    avgHoursPerEmployee: number;
}

export default function OvertimeReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState('2025-01');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [reportType, setReportType] = useState('employee');

    const employeeReports: OvertimeReport[] = [
        { id: '1', employeeId: 'EMP002', employeeName: 'Michael Chen', department: 'Production', totalHours: 24, paidHours: 20, compOffHours: 4, totalAmount: 1200, month: '2025-01' },
        { id: '2', employeeId: 'EMP003', employeeName: 'Emily Davis', department: 'Quality Assurance', totalHours: 12, paidHours: 8, compOffHours: 4, totalAmount: 480, month: '2025-01' },
        { id: '3', employeeId: 'EMP004', employeeName: 'David Wilson', department: 'Production', totalHours: 18, paidHours: 18, compOffHours: 0, totalAmount: 900, month: '2025-01' },
        { id: '4', employeeId: 'EMP006', employeeName: 'Robert Martinez', department: 'IT', totalHours: 16, paidHours: 8, compOffHours: 8, totalAmount: 640, month: '2025-01' },
        { id: '5', employeeId: 'EMP007', employeeName: 'Lisa Wong', department: 'Production', totalHours: 8, paidHours: 8, compOffHours: 0, totalAmount: 320, month: '2025-01' },
        { id: '6', employeeId: 'EMP008', employeeName: 'James Taylor', department: 'Warehouse', totalHours: 20, paidHours: 12, compOffHours: 8, totalAmount: 720, month: '2025-01' }
    ];

    const departmentSummaries: DepartmentSummary[] = [
        { department: 'Production', totalHours: 50, totalEmployees: 3, totalCost: 2420, avgHoursPerEmployee: 16.7 },
        { department: 'Quality Assurance', totalHours: 12, totalEmployees: 1, totalCost: 480, avgHoursPerEmployee: 12 },
        { department: 'IT', totalHours: 16, totalEmployees: 1, totalCost: 640, avgHoursPerEmployee: 16 },
        { department: 'Warehouse', totalHours: 20, totalEmployees: 1, totalCost: 720, avgHoursPerEmployee: 20 }
    ];

    const departments = Array.from(new Set(employeeReports.map(r => r.department)));

    const filteredReports = employeeReports.filter(report =>
        departmentFilter === 'all' || report.department === departmentFilter
    );

    const totalStats = {
        totalHours: employeeReports.reduce((sum, r) => sum + r.totalHours, 0),
        paidHours: employeeReports.reduce((sum, r) => sum + r.paidHours, 0),
        compOffHours: employeeReports.reduce((sum, r) => sum + r.compOffHours, 0),
        totalCost: employeeReports.reduce((sum, r) => sum + r.totalAmount, 0)
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                            Overtime Reports
                        </h1>
                        <p className="text-gray-400 mt-1">Analyze overtime trends and costs</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total OT Hours</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalHours}h</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Paid Hours</p>
                        <p className="text-3xl font-bold text-white">{totalStats.paidHours}h</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Comp-Off Hours</p>
                        <p className="text-3xl font-bold text-white">{totalStats.compOffHours}h</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-blue-400 text-sm">Total Cost</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(totalStats.totalCost)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => setReportType('employee')}
                            className={`px-4 py-2 rounded-lg text-sm ${reportType === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            By Employee
                        </button>
                        <button
                            onClick={() => setReportType('department')}
                            className={`px-4 py-2 rounded-lg text-sm ${reportType === 'department' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            By Department
                        </button>
                    </div>
                </div>

                {reportType === 'employee' ? (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Total Hours</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Paid Hours</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Comp-Off Hours</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                                                    {report.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{report.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{report.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{report.department}</td>
                                        <td className="p-4 text-center">
                                            <span className="text-orange-400 font-medium">{report.totalHours}h</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-green-400 font-medium">{report.paidHours}h</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-purple-400 font-medium">{report.compOffHours}h</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-blue-400 font-medium">{formatCurrency(report.totalAmount)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-700/30">
                                    <td colSpan={2} className="p-4 text-white font-medium">Total</td>
                                    <td className="p-4 text-center text-orange-400 font-bold">{totalStats.totalHours}h</td>
                                    <td className="p-4 text-center text-green-400 font-bold">{totalStats.paidHours}h</td>
                                    <td className="p-4 text-center text-purple-400 font-bold">{totalStats.compOffHours}h</td>
                                    <td className="p-4 text-right text-blue-400 font-bold">{formatCurrency(totalStats.totalCost)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {departmentSummaries.map((dept) => (
                            <div key={dept.department} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-white">{dept.department}</h3>
                                    <span className="text-2xl font-bold text-orange-400">{dept.totalHours}h</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-700/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-400">Employees</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">{dept.totalEmployees}</p>
                                    </div>
                                    <div className="p-3 bg-gray-700/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-400">Avg Hours/Employee</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">{dept.avgHoursPerEmployee.toFixed(1)}h</p>
                                    </div>
                                    <div className="col-span-2 p-3 bg-blue-500/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm text-blue-400">Total Cost</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{formatCurrency(dept.totalCost)}</p>
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
