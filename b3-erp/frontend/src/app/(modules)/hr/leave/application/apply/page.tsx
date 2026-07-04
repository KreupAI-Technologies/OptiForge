'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    FileText,
    Send,
    AlertCircle,
    CheckCircle,
    User,
    Briefcase
} from 'lucide-react';
import { LeaveService } from '@/services/leave.service';

interface LeaveBalance {
    type: string;
    total: number;
    used: number;
    pending: number;
    available: number;
}

export default function ApplyLeavePage() {
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [halfDay, setHalfDay] = useState(false);
    const [halfDayType, setHalfDayType] = useState('first');
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    const leaveTypes = [
        'Annual Leave',
        'Sick Leave',
        'Casual Leave',
        'Maternity Leave',
        'Paternity Leave',
        'Bereavement Leave',
        'Compensatory Off',
        'Unpaid Leave'
    ];

    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await LeaveService.getAllLeaveBalances();
                const mapped: LeaveBalance[] = (raw as any[]).map((r) => {
                    const total = r?.entitledDays ?? r?.total ?? 0;
                    const used = r?.usedDays ?? r?.used ?? 0;
                    const pending = r?.pendingDays ?? r?.pending ?? 0;
                    return {
                        type: r?.leaveTypeName ?? r?.type ?? '',
                        total,
                        used,
                        pending,
                        available: r?.balanceDays ?? r?.available ?? (total - used - pending),
                    };
                });
                if (!cancelled) setLeaveBalances(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setLeaveBalances([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return halfDay ? 0.5 : diffDays;
    };

    const selectedBalance = leaveBalances.find(b => b.type === leaveType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-green-500" />
                            Apply Leave
                        </h1>
                        <p className="text-gray-400 mt-1">Submit a new leave request</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {leaveBalances.map((balance) => (
                        <div key={balance.type} className={`rounded-xl p-4 border ${leaveType === balance.type ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
                            <p className="text-gray-400 text-sm">{balance.type}</p>
                            <p className="text-3xl font-bold text-white">{balance.available}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Used: {balance.used} | Pending: {balance.pending}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-6">Leave Request Form</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Leave Type *</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select Leave Type</option>
                                    {leaveTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">End Date *</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-white cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={halfDay}
                                        onChange={(e) => setHalfDay(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                                    />
                                    Half Day
                                </label>
                                {halfDay && (
                                    <select
                                        value={halfDayType}
                                        onChange={(e) => setHalfDayType(e.target.value)}
                                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="first">First Half</option>
                                        <option value="second">Second Half</option>
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Reason *</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                    placeholder="Please provide a reason for your leave request..."
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Attachment (Optional)</label>
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                                    <input
                                        type="file"
                                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <FileText className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                                        <p className="text-gray-400">
                                            {attachment ? attachment.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                    <Send className="w-5 h-5" />
                                    Submit Request
                                </button>
                                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                    Save Draft
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Request Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Leave Type</span>
                                    <span className="text-white font-medium">{leaveType || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duration</span>
                                    <span className="text-white font-medium">{calculateDays()} day(s)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Start Date</span>
                                    <span className="text-white font-medium">{startDate || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">End Date</span>
                                    <span className="text-white font-medium">{endDate || '-'}</span>
                                </div>
                                {selectedBalance && (
                                    <>
                                        <hr className="border-gray-700" />
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Available Balance</span>
                                            <span className="text-green-400 font-medium">{selectedBalance.available} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">After Request</span>
                                            <span className={`font-medium ${selectedBalance.available - calculateDays() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {selectedBalance.available - calculateDays()} days
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-blue-400 font-medium">Leave Policy</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Leave requests must be submitted at least 3 days in advance for planned leaves. Emergency leaves require manager approval within 24 hours.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                            <h4 className="text-white font-medium mb-3">Reporting Manager</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                    J
                                </div>
                                <div>
                                    <p className="text-white">John Smith</p>
                                    <p className="text-xs text-gray-400">Engineering Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
