'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    LayoutList,
    ChevronRight,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    Info,
    ChevronDown,
    ArrowRight,
    Maximize2,
    BarChart3
} from 'lucide-react';
import { WORKFLOW_PHASES, MASTER_CHECKLIST_STEPS, SIDEBAR_PHASE_MAPPING } from '@/lib/projectChecklistData';

interface ProjectRoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
}

type ViewType = 'roadmap' | 'gantt';

export function ProjectRoadmapModal({ isOpen, onClose, project }: ProjectRoadmapModalProps) {
    const [view, setView] = useState<ViewType>('roadmap');
    const [selectedStep, setSelectedStep] = useState<any>(null);
    const [expandedPhases, setExpandedPhases] = useState<string[]>(['phase-1']);

    const togglePhase = (phaseId: string) => {
        setExpandedPhases(prev =>
            prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
        );
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'completed':
                return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
            case 'In Progress':
            case 'required':
                return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
            case 'Delayed':
                return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
            case 'not_applicable':
                return { icon: X, color: 'text-gray-300', bg: 'bg-gray-50', border: 'border-gray-200' };
            default:
                return { icon: Circle, color: 'text-gray-400', bg: 'bg-white', border: 'border-gray-200' };
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Project Roadmap
                                <span className="text-xs font-normal bg-blue-500/30 px-2 py-0.5 rounded-full text-blue-100">
                                    {project?.projectNumber}
                                </span>
                            </h2>
                            <p className="text-slate-400 text-sm font-medium">{project?.projectName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-slate-700/50 p-1 rounded-lg flex items-center gap-1 border border-slate-600">
                            <button
                                onClick={() => setView('roadmap')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'roadmap' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <LayoutList className="w-4 h-4" />
                                Roadmap
                            </button>
                            <button
                                onClick={() => setView('gantt')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'gantt' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Calendar className="w-4 h-4" />
                                Gantt Chart
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition-all text-slate-400 border border-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* View Wrapper */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
                        {view === 'roadmap' ? (
                            <RoadmapView
                                expandedPhases={expandedPhases}
                                togglePhase={togglePhase}
                                onStepClick={setSelectedStep}
                                selectedStep={selectedStep}
                                getStatusInfo={getStatusInfo}
                                project={project}
                            />
                        ) : (
                            <GanttView
                                onStepClick={setSelectedStep}
                                selectedStep={selectedStep}
                                getStatusInfo={getStatusInfo}
                                project={project}
                            />
                        )}
                    </div>

                    {/* Side Details Panel */}
                    <AnimatePresence>
                        {selectedStep && (
                            <motion.div
                                initial={{ x: 400 }}
                                animate={{ x: 0 }}
                                exit={{ x: 400 }}
                                className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-10"
                            >
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        Step Details
                                    </h3>
                                    <button
                                        onClick={() => setSelectedStep(null)}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-6 overflow-y-auto">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Step Name</label>
                                        <div className="text-lg font-black text-slate-800 leading-tight">
                                            {selectedStep.name}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {selectedStep.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-black uppercase ${getStatusInfo(selectedStep.status).bg} ${getStatusInfo(selectedStep.status).color}`}>
                                                {selectedStep.status}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phase</label>
                                            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full inline-block">
                                                {selectedStep.phaseId.replace('phase-', 'Phase ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95">
                                            Update Status
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

function RoadmapView({ expandedPhases, togglePhase, onStepClick, selectedStep, getStatusInfo, project }: any) {
    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {WORKFLOW_PHASES.map((phase, idx) => {
                const isExpanded = expandedPhases.includes(phase.id);
                const steps = MASTER_CHECKLIST_STEPS[phase.id] || [];
                const phaseProgress = 0; // Simplified for now

                return (
                    <div key={phase.id} className="relative">
                        {/* Timeline vertical line */}
                        {idx < WORKFLOW_PHASES.length - 1 && (
                            <div className="absolute left-[26px] top-12 bottom-0 w-0.5 bg-slate-200 z-0" />
                        )}

                        <div className="flex gap-4">
                            {/* Phase Circle */}
                            <div className="relative z-10 w-14 h-14 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
                                <div className="text-blue-600 font-black text-lg">{idx + 1}</div>
                            </div>

                            <div className="flex-1 pb-8">
                                <div
                                    onClick={() => togglePhase(phase.id)}
                                    className={`group bg-white rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${isExpanded ? 'border-blue-500 shadow-xl shadow-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{phase.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{phase.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Progress</div>
                                                <div className="text-sm font-black text-blue-600">0%</div>
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-50 bg-slate-50/50"
                                            >
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {steps.map((step: any) => {
                                                        const { icon: StatusIcon, color, bg, border } = getStatusInfo('required');
                                                        const isSelected = selectedStep?.id === step.id;

                                                        return (
                                                            <div
                                                                key={step.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onStepClick({ ...step, phaseId: phase.id, status: 'required' });
                                                                }}
                                                                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer ${isSelected ? 'bg-white border-blue-600 shadow-md ring-4 ring-blue-50' : 'bg-white border-white hover:border-slate-200 hover:shadow-sm'}`}
                                                            >
                                                                <div className={`p-2 rounded-lg ${bg}`}>
                                                                    <StatusIcon className={`w-4 h-4 ${color}`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-[13px] font-bold text-slate-800 leading-tight">{step.name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-medium tracking-tight truncate max-w-[150px]">{step.description}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function GanttView({ onStepClick, selectedStep, getStatusInfo, project }: any) {
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Header / Timeline Labels */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                <div className="w-64 p-3 border-r border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Workflow Phases & Steps
                </div>
                <div className="flex-1 flex text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {months.map(month => (
                        <div key={month} className="flex-1 p-3 border-r border-slate-100 last:border-0 text-center">
                            {month}
                        </div>
                    ))}
                </div>
            </div>

            {/* Scrollable Rows */}
            <div className="flex-1 overflow-y-auto">
                {WORKFLOW_PHASES.map((phase, pIdx) => (
                    <div key={phase.id}>
                        {/* Phase Header Row */}
                        <div className="flex bg-slate-50/80 border-b border-slate-100 group">
                            <div className="w-64 p-3 border-r border-slate-200 flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-600 rounded text-[10px] text-white font-black flex items-center justify-center">
                                    P{pIdx + 1}
                                </div>
                                <span className="text-xs font-black text-slate-900 truncate">{phase.name}</span>
                            </div>
                            <div className="flex-1 relative">
                                {/* Timeline Grid Lines */}
                                <div className="absolute inset-0 flex">
                                    {months.map(m => <div key={m} className="flex-1 border-r border-slate-100 last:border-0" />)}
                                </div>
                                {/* Phase Bar (Summary) */}
                                <div
                                    className="absolute h-1.5 top-1/2 -translate-y-1/2 bg-blue-600/30 rounded-full border border-blue-600/50"
                                    style={{ left: `${pIdx * 12.5}%`, width: '15%' }}
                                />
                            </div>
                        </div>

                        {/* Steps Rows */}
                        {(MASTER_CHECKLIST_STEPS[phase.id] || []).map((step: any, sIdx: any) => {
                            const isSelected = selectedStep?.id === step.id;
                            const status: string = 'required';
                            const { icon: StatusIcon, color, bg } = getStatusInfo(status);

                            return (
                                <div
                                    key={step.id}
                                    className={`flex border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => onStepClick({ ...step, phaseId: phase.id, status })}
                                >
                                    <div className="w-64 p-2.5 pl-10 border-r border-slate-200 flex items-center gap-2">
                                        <div className={`p-1 rounded ${bg}`}>
                                            <StatusIcon className={`w-3 h-3 ${color}`} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700 truncate">{step.name}</span>
                                    </div>
                                    <div className="flex-1 relative py-2">
                                        <div className="absolute inset-0 flex">
                                            {months.map(m => <div key={m} className="flex-1 border-r border-slate-50 last:border-0" />)}
                                        </div>
                                        {/* Task Bar */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '8%' }}
                                            className={`absolute h-6 top-1/2 -translate-y-1/2 rounded-md shadow-sm border flex items-center px-1.5 gap-1.5 transition-all group-hover:shadow-md ${status === 'completed' ? 'bg-green-500 border-green-600 shadow-green-100' : 'bg-blue-500 border-blue-600 shadow-blue-100'}`}
                                            style={{ left: `${pIdx * 12 + sIdx * 2}%` }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                            {isSelected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border-2 border-white rounded-full" />}
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend / Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        Completed
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        In Progress
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-slate-200" />
                        Pending
                    </div>
                </div>
                <div className="text-slate-500 italic">Timeline is automatically calculated based on project start/end dates.</div>
            </div>
        </div>
    );
}

