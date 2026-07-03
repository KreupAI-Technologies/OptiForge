'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    ShoppingBag,
    Truck,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    Filter,
    FileText,
    Boxes
} from 'lucide-react';

interface MaterialStatus {
    id: string;
    name: string;
    totalQty: number;
    reserved: number;
    ordered: number;
    received: number;
    status: 'Ready' | 'Procuring' | 'Delayed' | 'Stock Gap';
}

const mockMaterials: MaterialStatus[] = [
    { id: '1', name: 'Aluminium Extrusion 40x40', totalQty: 120, reserved: 80, ordered: 40, received: 0, status: 'Procuring' },
    { id: '2', name: 'Stainless Steel Sheet 2mm', totalQty: 50, reserved: 50, ordered: 0, received: 50, status: 'Ready' },
    { id: '3', name: 'M6 Bolt & Nut Set', totalQty: 1000, reserved: 200, ordered: 800, received: 0, status: 'Delayed' },
];

export default function ProcurementDashboard() {
    const params = useParams() as { id?: string };
    const [materials, setMaterials] = useState<MaterialStatus[]>(mockMaterials);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listMaterialStatus();
                if (!active) return;
                if (rows && rows.length > 0) {
                    setMaterials(rows.map((r) => ({
                        id: r.id,
                        name: r.name || '',
                        totalQty: r.totalQty ?? 0,
                        reserved: r.reserved ?? 0,
                        ordered: r.ordered ?? 0,
                        received: r.received ?? 0,
                        status: (r.status as MaterialStatus['status']) || 'Procuring',
                    })));
                }
                setError(null);
            } catch (e) {
                if (active) setError('Failed to load materials');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [params?.id]);

    return (
        <div className="w-full space-y-4 px-3 py-2">
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg">{error}</div>
            )}
            {loading && (
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading materials…</div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">Procurement Dashboard</h1>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 4.2-4.11 | Material Lifecycle</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all border-b-2 border-slate-950 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Generate PR
                    </button>
                </div>
            </div>

            {/* Procurement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Commitment</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-500">Reserved Items</span>
                            <span className="text-gray-900">142 / 200</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '71%' }}></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supply Pipeline</div>
                        <Truck className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-500">In Transit (PO)</span>
                            <span className="text-gray-900">8 Open POs</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl text-white">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget Utilization</div>
                    <div className="text-2xl font-black italic">$42,300.00</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">70% of Project Material Budget</div>
                </div>
            </div>

            {/* Material Readiness Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Boxes className="w-4 h-4" /> Material Readiness Matrix
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Item Description</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Inventory Reservation</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">PO Status</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">GRN / In-Store</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {materials.map(mat => (
                                <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="text-xs font-bold text-gray-900">{mat.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">Total Req: {mat.totalQty} Units</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${mat.reserved >= mat.totalQty ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <span className="text-xs font-bold text-gray-600">{mat.reserved} Reserved</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-bold text-gray-600">{mat.ordered} Ordered</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className={`w-3.5 h-3.5 ${mat.received >= mat.totalQty ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            <span className="text-xs font-bold text-gray-600">{mat.received} Received</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${mat.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {mat.status}
                                            </span>
                                            <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-900 rounded-full"
                                                    style={{ width: `${(mat.received / mat.totalQty) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
