'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
    Camera,
    Clipboard,
    Save,
    MapPin,
    ArrowLeft,
    ChevronDown,
    Plus,
    Trash2,
    Calendar,
    User,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface SurveyField {
    label: string;
    value: string;
}

export default function SiteAssessmentPage() {
    const params = useParams();
    const id = String(params?.id ?? '');
    const projectId = id;
    const [activeSection, setActiveSection] = useState('dimensions');

    const sections = [
        { id: 'dimensions', label: 'Wall Dimensions', icon: Clipboard },
        { id: 'mep', label: 'Plumbing & Electrical', icon: MapPin },
        { id: 'photos', label: 'Site Photos', icon: Camera },
    ];

    const [surveys, setSurveys] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!projectId) { setIsLoading(false); return; }
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await projectManagementService.getDesignVerificationSurveys(projectId);
                if (!cancelled) setSurveys(raw || []);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load');
                    setSurveys([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [projectId]);

    // Derive editable dimension fields from the first fetched survey (if any),
    // otherwise fall back to the standard boundary template.
    const dimensionFields = useMemo<SurveyField[]>(() => {
        const first: any = surveys[0];
        const dims = first?.dimensions ?? first?.measurements ?? first?.fields;
        if (Array.isArray(dims) && dims.length > 0) {
            return dims.map((d: any) => ({
                label: d.label ?? d.name ?? 'Measurement',
                value: String(d.value ?? d.measurement ?? ''),
            }));
        }
        return [
            { label: 'Left Wall Length (mm)', value: '' },
            { label: 'Right Wall Length (mm)', value: '' },
            { label: 'Ceiling Height (mm)', value: '' },
            { label: 'Window Sill Height (mm)', value: '' },
        ];
    }, [surveys]);

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-20">
            {/* Mobile Header */}
            <div className="bg-slate-900 p-4 sticky top-0 z-10 safe-top">
                <div className="flex items-center gap-3">
                    <button className="text-white hover:bg-white/10 p-2 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">Site Survey</h1>
                        <p className="text-[10px] text-blue-300 font-bold mt-1 uppercase tracking-widest">{id}</p>
                    </div>
                </div>
            </div>

            {/* Sticky Section Tabs (Mobile Optimized) */}
            <div className="bg-white border-b border-gray-200 sticky top-[68px] z-10 flex overflow-x-auto no-scrollbar px-4 py-2 gap-4">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${activeSection === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-500 border-gray-100'
                            }`}
                    >
                        <s.icon className="w-3.5 h-3.5" />
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-4">
                {/* Meta Info */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Engineer</label>
                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold text-gray-700">John Engineer</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Survey Date</label>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold text-gray-700">06 Feb 2026</span>
                        </div>
                    </div>
                </div>

                {/* Section Content */}
                {activeSection === 'dimensions' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Critical Boundaries</h3>
                                <Plus className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="p-4 space-y-4">
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest py-2 justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading survey...
                                    </div>
                                )}
                                {loadError && !isLoading && (
                                    <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest">
                                        {loadError}
                                    </div>
                                )}
                                {dimensionFields.map((field, idx) => (
                                    <div key={idx} className="relative">
                                        <input
                                            type="number"
                                            defaultValue={field.value}
                                            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 text-sm font-bold pt-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                        <span className="absolute top-2 left-4 text-[8px] font-black text-gray-400 uppercase tracking-widest">{field.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'mep' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4">Plumbing Points</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">P1</div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-900">Main Drain Inlet</div>
                                            <div className="text-[9px] text-gray-500 mt-0.5">Verified at 450mm from CNR-1</div>
                                        </div>
                                    </div>
                                    <Trash2 className="w-4 h-4 text-gray-300" />
                                </div>
                                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all">
                                    <Plus className="w-4 h-4" />
                                    Add Plumbing Point
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'photos' && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="aspect-square bg-slate-200 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer hover:bg-slate-300 transition-all">
                            <Camera className="w-8 h-8" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Take Photo</span>
                        </div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square bg-white rounded-2xl border border-gray-100 shadow-sm p-1 group relative">
                                <img
                                    src={`https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80`}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="absolute bottom-1.5 left-1.5 right-1.5 p-1.5 bg-black/60 backdrop-blur rounded-lg text-[8px] font-black text-white uppercase tracking-widest text-center truncate">
                                    Survey Wall Side A
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-gray-200 flex gap-3 safe-bottom min-w-full">
                <button className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-200">
                    Draft Save
                </button>
                <button className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Submit Survey
                </button>
            </div>
        </div>
    );
}
