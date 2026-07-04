'use client';

import React, { useState, useEffect } from 'react';
import {
    Layers,
    Plus,
    Edit,
    Trash2,
    Search,
    ToggleRight,
    ToggleLeft,
    Calculator
} from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface SalaryComponent {
    id: string;
    code: string;
    name: string;
    description: string;
    type: 'Earning' | 'Deduction' | 'Reimbursement';
    category: 'Fixed' | 'Variable' | 'Statutory';
    calculationType: 'Fixed' | 'Percentage' | 'Formula';
    calculationBase: string;
    value: number;
    isTaxable: boolean;
    isStatutory: boolean;
    isActive: boolean;
}

export default function ComponentsMasterPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [components, setComponents] = useState<SalaryComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getSalaryComponents();
          const mapped: SalaryComponent[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setComponents(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setComponents([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredComponents = components.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || comp.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Earning': return 'bg-green-500/20 text-green-400';
            case 'Deduction': return 'bg-red-500/20 text-red-400';
            case 'Reimbursement': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Fixed': return 'bg-blue-500/20 text-blue-400';
            case 'Variable': return 'bg-purple-500/20 text-purple-400';
            case 'Statutory': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const earnings = components.filter(c => c.type === 'Earning' && c.isActive).length;
    const deductions = components.filter(c => c.type === 'Deduction' && c.isActive).length;
    const statutory = components.filter(c => c.isStatutory).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Layers className="w-8 h-8 text-blue-500" />
                            Components Master
                        </h1>
                        <p className="text-gray-400 mt-1">Configure salary components and calculations</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Component
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Earnings</p>
                        <p className="text-3xl font-bold text-white">{earnings}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Deductions</p>
                        <p className="text-3xl font-bold text-white">{deductions}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Statutory</p>
                        <p className="text-3xl font-bold text-white">{statutory}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Active</p>
                        <p className="text-3xl font-bold text-white">{components.filter(c => c.isActive).length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="Earning">Earnings</option>
                        <option value="Deduction">Deductions</option>
                        <option value="Reimbursement">Reimbursements</option>
                    </select>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Component</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Calculation</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Taxable</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComponents.map((comp) => (
                                    <tr key={comp.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">
                                                        {comp.code}
                                                    </span>
                                                    <span className="text-white font-medium">{comp.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{comp.description}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(comp.type)}`}>
                                                {comp.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(comp.category)}`}>
                                                {comp.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Calculator className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300 text-sm">
                                                    {comp.calculationType === 'Fixed' ? `$${comp.value}` :
                                                     comp.calculationType === 'Percentage' ? `${comp.value}% of ${comp.calculationBase}` :
                                                     'Formula-based'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${comp.isTaxable ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {comp.isTaxable ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {comp.isActive ? (
                                                <ToggleRight className="w-6 h-6 text-green-400 mx-auto cursor-pointer" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-gray-500 mx-auto cursor-pointer" />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {!comp.isStatutory && (
                                                    <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded">
                                                        <Trash2 className="w-4 h-4" />
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
