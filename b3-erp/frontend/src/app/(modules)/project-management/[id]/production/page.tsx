'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Activity,
    Cpu,
    Zap,
    Clock,
    AlertCircle,
    CheckCircle2,
    Gauge,
    Layers,
    Play,
    Pause,
    BarChart3
} from 'lucide-react';

interface MachineStatus {
    id: string;
    name: string;
    type: string;
    status: 'Running' | 'Idle' | 'Maintenance' | 'Offline';
    oee: number;
    currentJob: string;
}

export default function FactoryDashboard() {
    const params = useParams() as { id?: string };
    const [machines, setMachines] = useState<MachineStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listMachineStatus();
                if (!active) return;
                if (rows && rows.length > 0) {
                    setMachines(rows.map((r) => ({
                        id: r.id,
                        name: r.name || '',
                        type: r.type || '',
                        status: (r.status as MachineStatus['status']) || 'Idle',
                        oee: r.oee ?? 0,
                        currentJob: r.currentJob || '',
                    })));
                }
                setError(null);
            } catch (e) {
                if (active) setError('Failed to load machines');
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
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading machines…</div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none italic uppercase tracking-tighter">Factory Floor Control</h1>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Phase 5.5-5.10 | Real-Time OEE & Operations</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Plant OEE</div>
                        <div className="text-xl font-black text-slate-900 leading-none">82.4%</div>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 border-b-2 border-indigo-800">
                        Production Log
                    </button>
                </div>
            </div>

            {/* Machine Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {machines.map(machine => (
                    <div key={machine.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-100 transition-all group">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{machine.type}</div>
                                    <h3 className="text-sm font-black text-slate-900 italic tracking-tight">{machine.name}</h3>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${machine.status === 'Running' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${machine.status === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    {machine.status}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                                        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-indigo-600" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - machine.oee / 100)} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-black text-indigo-600 leading-none">{machine.oee}%</span>
                                        <span className="text-[6px] font-black text-slate-400 uppercase">OEE</span>
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Job</div>
                                        <div className="text-[10px] font-bold text-slate-800 line-clamp-1">{machine.currentJob}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><BarChart3 className="w-3.5 h-3.5 mx-auto" /></button>
                                        <button className="flex-1 py-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-amber-500 transition-all"><Zap className="w-3.5 h-3.5 mx-auto" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">OP</div>
                                ))}
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">2 Operators Assigned</span>
                        </div>
                    </div>
                ))}
                {!loading && machines.length === 0 && (
                    <div className="md:col-span-3 bg-white rounded-3xl border border-gray-100 p-10 text-center text-xs font-bold text-slate-400">
                        No machines found.
                    </div>
                )}
            </div>

            {/* Production Log Stream */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Real-Time Yield Stream</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 italic">IOT Sync Active</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Time</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Machine</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Operation</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Yield</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Reject</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { time: '14:20', machine: 'Laser-400', op: 'Thermal Cutting', yield: 42, reject: 1, status: 'Success' },
                                { time: '14:15', machine: 'Bend-210', op: 'Logo Etching', yield: 12, reject: 0, status: 'Success' },
                                { time: '14:02', machine: 'Bend-210', op: 'Precision Bending', yield: 0, reject: 0, status: 'Halted: No Logo' },
                            ].map((log, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 text-xs font-bold text-slate-400">{log.time}</td>
                                    <td className="p-4 text-xs font-bold text-slate-900">{log.machine}</td>
                                    <td className="p-4 text-xs font-bold text-indigo-600">{log.op}</td>
                                    <td className="p-4 text-center text-xs font-black text-emerald-600 italic">+{log.yield}</td>
                                    <td className="p-4 text-center text-xs font-black text-rose-600 italic">{log.reject}</td>
                                    <td className="p-4 text-right">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${log.status.includes('Success') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                                            }`}>
                                            {log.status}
                                        </span>
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
