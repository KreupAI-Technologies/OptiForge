'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    BarChart3,
    Search,
    Filter,
    Download,
    FileText,
    Calendar,
    TrendingUp,
    Users,
    DollarSign,
    PieChart,
    ArrowRight,
    Clock,
    Eye
} from 'lucide-react';

interface PayrollReport {
    id: string;
    reportName: string;
    reportType: 'Salary Register' | 'Bank Statement' | 'Statutory' | 'MIS' | 'Variance' | 'Summary';
    period: string;
    generatedDate: string;
    generatedBy: string;
    status: 'Ready' | 'Generating' | 'Scheduled';
    fileSize: string;
    downloadCount: number;
}

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'On-Demand';
}

export default function PayrollReportsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent');

    const [recentReports, setRecentReports] = useState<PayrollReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getReports('recent');
                const mapped: PayrollReport[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setRecentReports(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setRecentReports([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const reportTemplates: ReportTemplate[] = [
        {
            id: '1',
            name: 'Salary Register',
            description: 'Complete salary breakdown for all employees',
            category: 'Payroll',
            icon: 'FileText',
            frequency: 'Monthly'
        },
        {
            id: '2',
            name: 'Bank Payment Statement',
            description: 'Bank-wise payment file for salary disbursement',
            category: 'Payroll',
            icon: 'DollarSign',
            frequency: 'Monthly'
        },
        {
            id: '3',
            name: 'PF Contribution Report',
            description: 'Employee and employer PF contribution details',
            category: 'Statutory',
            icon: 'FileText',
            frequency: 'Monthly'
        },
        {
            id: '4',
            name: 'ESI Contribution Report',
            description: 'ESI contribution summary with employee details',
            category: 'Statutory',
            icon: 'FileText',
            frequency: 'Monthly'
        },
        {
            id: '5',
            name: 'TDS Summary',
            description: 'Monthly TDS deduction and challan summary',
            category: 'Statutory',
            icon: 'FileText',
            frequency: 'Monthly'
        },
        {
            id: '6',
            name: 'Department Cost Analysis',
            description: 'Cost breakdown by department with trends',
            category: 'MIS',
            icon: 'PieChart',
            frequency: 'Monthly'
        },
        {
            id: '7',
            name: 'Headcount Report',
            description: 'Employee count and movement analysis',
            category: 'MIS',
            icon: 'Users',
            frequency: 'Monthly'
        },
        {
            id: '8',
            name: 'Salary Variance Analysis',
            description: 'Month-on-month salary variance breakdown',
            category: 'Analytics',
            icon: 'TrendingUp',
            frequency: 'Monthly'
        },
        {
            id: '9',
            name: 'Annual Payroll Summary',
            description: 'Year-end payroll summary for all employees',
            category: 'Annual',
            icon: 'BarChart3',
            frequency: 'Annual'
        },
        {
            id: '10',
            name: 'Form 16 Batch',
            description: 'Generate Form 16 for all employees',
            category: 'Statutory',
            icon: 'FileText',
            frequency: 'Annual'
        }
    ];

    const filteredReports = recentReports.filter(report => {
        const matchesSearch = report.reportName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
        return matchesSearch && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ready': return 'bg-green-500/20 text-green-400';
            case 'Generating': return 'bg-blue-500/20 text-blue-400';
            case 'Scheduled': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Salary Register': return 'bg-blue-500/20 text-blue-400';
            case 'Bank Statement': return 'bg-green-500/20 text-green-400';
            case 'Statutory': return 'bg-purple-500/20 text-purple-400';
            case 'MIS': return 'bg-orange-500/20 text-orange-400';
            case 'Variance': return 'bg-pink-500/20 text-pink-400';
            case 'Summary': return 'bg-cyan-500/20 text-cyan-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Payroll': return 'bg-blue-500/20 text-blue-400';
            case 'Statutory': return 'bg-purple-500/20 text-purple-400';
            case 'MIS': return 'bg-orange-500/20 text-orange-400';
            case 'Analytics': return 'bg-pink-500/20 text-pink-400';
            case 'Annual': return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-cyan-500" />
                            Payroll Reports
                        </h1>
                        <p className="text-gray-400 mt-1">Generate and download payroll reports</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Calendar className="w-4 h-4" />
                            Schedule
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-400 text-sm">Total Reports</p>
                        <p className="text-3xl font-bold text-white">{recentReports.length}</p>
                        <p className="text-xs text-gray-400 mt-1">This month</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Ready</p>
                        <p className="text-3xl font-bold text-white">{recentReports.filter(r => r.status === 'Ready').length}</p>
                        <p className="text-xs text-gray-400 mt-1">Available for download</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Templates</p>
                        <p className="text-3xl font-bold text-white">{reportTemplates.length}</p>
                        <p className="text-xs text-gray-400 mt-1">Report types</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Downloads</p>
                        <p className="text-3xl font-bold text-white">{recentReports.reduce((sum, r) => sum + r.downloadCount, 0)}</p>
                        <p className="text-xs text-gray-400 mt-1">This month</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-700 pb-2">
                    <button
                        onClick={() => setActiveTab('recent')}
                        className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'recent' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Recent Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'templates' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Report Templates
                    </button>
                </div>

                {activeTab === 'recent' && (
                    <>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                            <div className="flex-1 min-w-[300px] relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="Salary Register">Salary Register</option>
                                    <option value="Bank Statement">Bank Statement</option>
                                    <option value="Statutory">Statutory</option>
                                    <option value="MIS">MIS</option>
                                    <option value="Variance">Variance</option>
                                    <option value="Summary">Summary</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left p-4 text-gray-400 font-medium">Report Name</th>
                                            <th className="text-center p-4 text-gray-400 font-medium">Type</th>
                                            <th className="text-center p-4 text-gray-400 font-medium">Period</th>
                                            <th className="text-center p-4 text-gray-400 font-medium">Generated</th>
                                            <th className="text-center p-4 text-gray-400 font-medium">Size</th>
                                            <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                            <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map((report) => (
                                            <tr key={report.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{report.reportName}</p>
                                                            <p className="text-xs text-gray-400">By {report.generatedBy}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(report.reportType)}`}>
                                                        {report.reportType}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-gray-300 text-sm">{report.period}</td>
                                                <td className="p-4 text-center text-gray-300 text-sm">
                                                    {new Date(report.generatedDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-center text-gray-300 text-sm">{report.fileSize}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                                                        {report.status === 'Generating' && <Clock className="w-3 h-3 animate-spin" />}
                                                        {report.status}
                                                    </span>
                                                    {report.downloadCount > 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">{report.downloadCount} downloads</p>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {report.status === 'Ready' && (
                                                            <button className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded">
                                                                <Download className="w-4 h-4" />
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
                    </>
                )}

                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                                        {template.icon === 'FileText' && <FileText className="w-6 h-6" />}
                                        {template.icon === 'DollarSign' && <DollarSign className="w-6 h-6" />}
                                        {template.icon === 'PieChart' && <PieChart className="w-6 h-6" />}
                                        {template.icon === 'Users' && <Users className="w-6 h-6" />}
                                        {template.icon === 'TrendingUp' && <TrendingUp className="w-6 h-6" />}
                                        {template.icon === 'BarChart3' && <BarChart3 className="w-6 h-6" />}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(template.category)}`}>
                                        {template.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                                <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{template.frequency}</span>
                                    <button className="flex items-center gap-1 text-cyan-400 text-sm group-hover:underline">
                                        Generate <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
