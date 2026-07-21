'use client';

import React, { useEffect, useState } from 'react';
import {
    Settings,
    Plus,
    Save,
    Clock,
    Percent,
} from 'lucide-react';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface RateRow {
    id: string;
    grade: string;
    designation: string;
    hourlyRate: number;
    multiplier: number;
    effectiveFrom: string;
    status: string;
}

// Backend returns snake_case Prisma rows; normalise defensively.
const mapRate = (r: any, i: number): RateRow => ({
    id: String(r?.id ?? i),
    grade: r?.grade ?? '',
    designation: r?.designation ?? '',
    hourlyRate: Number(r?.hourlyRate ?? r?.hourly_rate ?? 0),
    multiplier: Number(r?.multiplier ?? 1),
    effectiveFrom: (r?.effectiveFrom ?? r?.effective_from ?? '').toString().split('T')[0],
    status: r?.status ?? 'active',
});

export default function OvertimeSettingsPage() {
    const [rates, setRates] = useState<RateRow[]>([]);
    const [otRules, setOtRules] = useState('');
    const [compOffRules, setCompOffRules] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [savingRules, setSavingRules] = useState(false);

    // New-rate form.
    const emptyRate = { grade: '', designation: '', hourlyRate: '', multiplier: '1.5', effectiveFrom: new Date().toISOString().split('T')[0] };
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...emptyRate });
    const [savingRate, setSavingRate] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const [rawRates, settings] = await Promise.all([
                    HrSelfServiceService.getOvertimeRates(),
                    HrSelfServiceService.getOvertimeSettings(),
                ]);
                if (cancelled) return;
                setRates((Array.isArray(rawRates) ? rawRates : []).map(mapRate));
                const s: any = settings ?? {};
                setOtRules(JSON.stringify(s.otRules ?? s.ot_rules ?? {}, null, 2));
                setCompOffRules(JSON.stringify(s.compOffRules ?? s.comp_off_rules ?? {}, null, 2));
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [reloadKey]);

    const handleAddRate = async () => {
        setSavingRate(true); setBanner(null);
        try {
            await HrSelfServiceService.createOvertimeRate({
                grade: form.grade,
                designation: form.designation,
                hourlyRate: Number(form.hourlyRate) || 0,
                multiplier: Number(form.multiplier) || 1,
                effectiveFrom: form.effectiveFrom,
                status: 'active',
            });
            setShowForm(false);
            setForm({ ...emptyRate });
            setReloadKey((k) => k + 1);
            setBanner('Overtime rate added');
        } catch (e) {
            setBanner(e instanceof Error ? e.message : 'Failed to add rate');
        } finally {
            setSavingRate(false);
        }
    };

    const handleToggleStatus = async (row: RateRow) => {
        const next = row.status === 'active' ? 'inactive' : 'active';
        try {
            await HrSelfServiceService.updateOvertimeRate(row.id, { status: next });
            setRates((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
        } catch (e) {
            setBanner(e instanceof Error ? e.message : 'Failed to update rate');
        }
    };

    const handleSaveRules = async () => {
        setSavingRules(true); setBanner(null);
        try {
            const parse = (v: string) => {
                const t = v.trim();
                if (!t) return {};
                return JSON.parse(t);
            };
            await HrSelfServiceService.saveOvertimeSettings({
                otRules: parse(otRules),
                compOffRules: parse(compOffRules),
            });
            setBanner('Overtime rules saved');
        } catch (e) {
            setBanner(e instanceof SyntaxError ? 'Rules must be valid JSON' : (e instanceof Error ? e.message : 'Failed to save rules'));
        } finally {
            setSavingRules(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                {banner && (<div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{banner}</div>)}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Settings className="w-8 h-8 text-purple-500" />
                            Overtime Settings
                        </h1>
                        <p className="text-gray-400 mt-1">Configure overtime rates and calculation rules</p>
                    </div>
                    <button
                        onClick={() => { setShowForm((v) => !v); setBanner(null); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Rate
                    </button>
                </div>

                {showForm && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
                        <h3 className="text-lg font-semibold text-white">New Overtime Rate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" placeholder="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="text" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="number" step="0.01" placeholder="Hourly Rate" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="number" step="0.1" placeholder="Multiplier" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAddRate} disabled={savingRate || !form.grade} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg">
                                {savingRate ? 'Saving…' : 'Add Rate'}
                            </button>
                            <button onClick={() => { setShowForm(false); setForm({ ...emptyRate }); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Rates table */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">Overtime Rates</h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-4 text-gray-400 font-medium">Grade</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Designation</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Hourly Rate</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Multiplier</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Effective From</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map((r) => (
                                <tr key={r.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-4 text-white font-medium">{r.grade}</td>
                                    <td className="p-4 text-gray-300">{r.designation || '-'}</td>
                                    <td className="p-4 text-center text-gray-300">{r.hourlyRate}</td>
                                    <td className="p-4 text-center text-purple-400 font-medium">{r.multiplier}x</td>
                                    <td className="p-4 text-gray-300">{r.effectiveFrom || '-'}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleToggleStatus(r)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                                        >
                                            {r.status}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rates.length === 0 && !isLoading && (
                                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No overtime rates configured</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Rules editor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Overtime Rules (JSON)
                        </h3>
                        <textarea
                            value={otRules}
                            onChange={(e) => setOtRules(e.target.value)}
                            rows={8}
                            spellCheck={false}
                            className="w-full font-mono text-sm px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-400" />
                            Comp-Off Rules (JSON)
                        </h3>
                        <textarea
                            value={compOffRules}
                            onChange={(e) => setCompOffRules(e.target.value)}
                            rows={8}
                            spellCheck={false}
                            className="w-full font-mono text-sm px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSaveRules}
                        disabled={savingRules}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {savingRules ? 'Saving…' : 'Save Rules'}
                    </button>
                </div>
            </div>
        </div>
    );
}
