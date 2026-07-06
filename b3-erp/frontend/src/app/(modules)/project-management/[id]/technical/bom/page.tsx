'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Package,
    Layers,
    ChevronRight,
    ChevronDown,
    Plus,
    Trash2,
    RefreshCw,
    Lock,
    Unlock,
    Info,
    AlertCircle,
    CheckCircle2,
    Search
} from 'lucide-react';

interface BOMItem {
    id: string;
    itemId: string;
    name: string;
    sku: string;
    quantity: number;
    uom: string;
    level: number;
    status: 'In Stock' | 'Low Stock' | 'Lead Time: 2w';
    children?: BOMItem[];
}

export default function BOMManagementPage() {
    const { id } = useParams() as { id: string };
    const [isLocked, setIsLocked] = useState(false);
    const [expandedRows, setExpandedRows] = useState<string[]>(['1']);
    const [bom, setBom] = useState<BOMItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listBomItems();
                if (!active) return;
                if (rows && rows.length > 0) {
                    // Build a tree from flat rows using parentId
                    const byId = new Map<string, BOMItem>();
                    rows.forEach((r) => byId.set(r.id, {
                        id: r.id,
                        itemId: r.itemId || '',
                        name: r.name || '',
                        sku: r.sku || '',
                        quantity: r.quantity ?? 0,
                        uom: r.uom || '',
                        level: r.level ?? 0,
                        status: (r.status as BOMItem['status']) || 'In Stock',
                        children: [],
                    }));
                    const roots: BOMItem[] = [];
                    rows.forEach((r) => {
                        const node = byId.get(r.id)!;
                        if (r.parentId && byId.has(r.parentId)) {
                            byId.get(r.parentId)!.children!.push(node);
                        } else {
                            roots.push(node);
                        }
                    });
                    setBom(roots);
                }
                setError(null);
            } catch (e) {
                if (active) setError('Failed to load BOM');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [id]);

    const toggleRow = (rowId: string) => {
        setExpandedRows(prev =>
            prev.includes(rowId) ? prev.filter(i => i !== rowId) : [...prev, rowId]
        );
    };

    const getStatusStyle = (status: string) => {
        if (status === 'In Stock') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (status === 'Low Stock') return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    return (
        <div className="w-full space-y-4 px-3 py-2">
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg">{error}</div>
            )}
            {loading && (
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading BOM…</div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">Bill of Materials (BOM)</h1>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 3.8-3.11 | Technical Manufacturing Specs</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border-b-2 ${isLocked ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800'
                            }`}
                    >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {isLocked ? 'BOM Locked' : 'Verified & Lock'}
                    </button>
                    {!isLocked && (
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all border-b-2 border-indigo-800 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Root Item
                        </button>
                    )}
                </div>
            </div>

            {/* BOM Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Component Hierarchy</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">SKU / Item Code</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Qty</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">UOM</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Inventory Status</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {bom.map(item => (
                                <React.Fragment key={item.id}>
                                    <tr className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {item.children && (
                                                    <button onClick={() => toggleRow(item.id)} className="text-slate-400">
                                                        {expandedRows.includes(item.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                )}
                                                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-[10px] font-black text-slate-500">{item.sku}</td>
                                        <td className="p-4 text-center">
                                            <span className="text-xs font-black text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">{item.quantity}</span>
                                        </td>
                                        <td className="p-4 text-xs font-bold text-gray-500 uppercase">{item.uom}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button className="text-slate-400 hover:text-indigo-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                                            <button className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                    {expandedRows.includes(item.id) && item.children?.map(child => (
                                        <tr key={child.id} className="bg-slate-50/20 hover:bg-slate-50 transition-colors">
                                            <td className="p-4 pl-12">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                    <span className="text-xs font-bold text-gray-700">{child.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-[10px] font-bold text-slate-400">{child.sku}</td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    defaultValue={child.quantity}
                                                    disabled={isLocked}
                                                    className="w-16 bg-white border border-gray-200 rounded p-1 text-center text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="p-4 text-xs font-bold text-gray-500 uppercase">{child.uom}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${getStatusStyle(child.status)}`}>
                                                    {child.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {!isLocked && <button className="text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {!loading && bom.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-xs font-bold text-gray-400">No BOM items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Inventory Linked</h4>
                        <p className="text-[10px] text-emerald-700 font-bold mt-1">100% of line items are valid Inventory codes. Project is ready for PR generation.</p>
                    </div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">BOM Sync Auto</h4>
                        <p className="text-[10px] text-indigo-700 font-bold mt-1">Latest drawing revisions (v3.2) were cross-checked 2 hours ago.</p>
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between text-white">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Procurement Status</div>
                        <div className="text-xs font-bold italic">Awaiting BOM Release</div>
                    </div>
                    <button
                        disabled={!isLocked}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isLocked ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Push to PR
                    </button>
                </div>
            </div>
        </div>
    );
}
