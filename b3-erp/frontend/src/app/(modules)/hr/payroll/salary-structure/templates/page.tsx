'use client';

import React, { useState, useEffect } from 'react';
import {
    FileSpreadsheet,
    Plus,
    Edit,
    Trash2,
    Search,
    Eye,
    Copy,
    Users
} from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface SalaryTemplate {
    id: string;
    name: string;
    description: string;
    grade: string;
    ctcRange: { min: number; max: number };
    components: TemplateComponent[];
    employeesAssigned: number;
    isActive: boolean;
    lastModified: string;
}

interface TemplateComponent {
    code: string;
    name: string;
    type: 'Earning' | 'Deduction';
    percentage: number;
}

export default function SalaryTemplatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

    const [templates, setTemplates] = useState<SalaryTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getSalaryTemplates();
          const mapped: SalaryTemplate[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setTemplates(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setTemplates([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `${(value / 100000).toFixed(1)}L`;
        }
        return `${(value / 1000).toFixed(0)}K`;
    };

    const totalEmployees = templates.reduce((sum, t) => sum + t.employeesAssigned, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-green-500" />
                            Salary Templates
                        </h1>
                        <p className="text-gray-400 mt-1">Configure salary structure templates by grade</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        Create Template
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total Templates</p>
                        <p className="text-3xl font-bold text-white">{templates.length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Active Templates</p>
                        <p className="text-3xl font-bold text-white">{templates.filter(t => t.isActive).length}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Employees Covered</p>
                        <p className="text-3xl font-bold text-white">{totalEmployees}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Grades Defined</p>
                        <p className="text-3xl font-bold text-white">{templates.length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
                        >
                            <div
                                className="p-6 cursor-pointer hover:bg-gray-700/30 transition-colors"
                                onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                                                Grade {template.grade}
                                            </span>
                                            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                            {template.isActive && (
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Active</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">{template.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            <span className="text-gray-400">
                                                CTC: <span className="text-white">{formatCurrency(template.ctcRange.min)} - {formatCurrency(template.ctcRange.max)}</span>
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">{template.employeesAssigned} employees</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {expandedTemplate === template.id && (
                                <div className="border-t border-gray-700 p-6 bg-gray-700/20">
                                    <h4 className="text-white font-medium mb-4">Salary Components</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-green-400 text-sm mb-2">Earnings</p>
                                            <div className="space-y-2">
                                                {template.components.filter(c => c.type === 'Earning').map((comp) => (
                                                    <div key={comp.code} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                                                        <div>
                                                            <span className="text-xs text-gray-500 font-mono">{comp.code}</span>
                                                            <p className="text-white text-sm">{comp.name}</p>
                                                        </div>
                                                        <span className="text-green-400 font-medium">{comp.percentage}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-red-400 text-sm mb-2">Deductions</p>
                                            <div className="space-y-2">
                                                {template.components.filter(c => c.type === 'Deduction').map((comp) => (
                                                    <div key={comp.code} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                                                        <div>
                                                            <span className="text-xs text-gray-500 font-mono">{comp.code}</span>
                                                            <p className="text-white text-sm">{comp.name}</p>
                                                        </div>
                                                        <span className="text-red-400 font-medium">{comp.percentage}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">Last modified: {new Date(template.lastModified).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
