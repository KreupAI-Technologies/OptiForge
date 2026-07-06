'use client';

import { DollarSign, FileText, CheckCircle, Calculator, CreditCard, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { OffboardingService, SettlementStatus } from '@/services/offboarding.service';

export default function FNFPage() {
    const [stats, setStats] = useState({
        pendingSettlements: 0,
        completedSettlements: 0,
        totalDisbursed: 0,
        avgProcessingTime: '5 days'
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [dashboard, settlementsRes] = await Promise.all([
                    OffboardingService.getOffboardingDashboard(),
                    OffboardingService.getSettlements(),
                ]);
                if (!mounted) return;
                const settlements = settlementsRes?.data ?? [];
                const paid = settlements.filter((s) => s.status === SettlementStatus.PAID);
                const totalDisbursed = paid.reduce((sum, s) => sum + (s.netPayable || 0), 0);
                setStats({
                    pendingSettlements: dashboard?.pendingSettlements ?? 0,
                    completedSettlements: paid.length,
                    totalDisbursed,
                    // No matching real field; keep static text
                    avgProcessingTime: '5 days'
                });
            } catch {
                if (!mounted) return;
                setStats({
                    pendingSettlements: 0,
                    completedSettlements: 0,
                    totalDisbursed: 0,
                    avgProcessingTime: '5 days'
                });
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const modules = [
        {
            title: 'Gratuity',
            description: 'Calculate and process gratuity for eligible employees',
            icon: <Calculator className="h-6 w-6 text-blue-600" />,
            color: 'bg-blue-50 border-blue-200',
            href: '/hr/offboarding/fnf/gratuity',
            status: '8 Pending'
        },
        {
            title: 'Leave Encashment',
            description: 'Encashment of earned leaves as per policy',
            icon: <Clock className="h-6 w-6 text-yellow-600" />,
            color: 'bg-yellow-50 border-yellow-200',
            href: '/hr/offboarding/fnf/leave',
            status: '5 Pending'
        },
        {
            title: 'Salary Settlement',
            description: 'Final month salary, notice period, and recovery',
            icon: <DollarSign className="h-6 w-6 text-green-600" />,
            color: 'bg-green-50 border-green-200',
            href: '/hr/offboarding/fnf/salary',
            status: '3 Pending'
        },
        {
            title: 'Final Payment',
            description: 'Consolidated settlement and bank transfer',
            icon: <CreditCard className="h-6 w-6 text-purple-600" />,
            color: 'bg-purple-50 border-purple-200',
            href: '/hr/offboarding/fnf/payment',
            status: 'Ready to Pay'
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Full & Final Settlement</h1>
                <p className="text-gray-600 mt-2">Manage employee exit settlements and clearance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingSettlements}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedSettlements}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Disbursed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{(stats.totalDisbursed / 100000).toFixed(2)}L</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Avg. Time</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgProcessingTime}</p>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">Settlement Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map((module) => (
                    <Link href={module.href} key={module.title} className="block group">
                        <div className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${module.color} flex items-start gap-2 h-full`}>
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                {module.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {module.title}
                                    </h3>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-600 mt-1 mb-3">{module.description}</p>
                                <div className="inline-block bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                                    {module.status}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <h3 className="font-semibold text-blue-900 mb-2">Process Overview</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Calculate <strong>Gratuity</strong> based on tenure (requires 5+ years).</li>
                    <li>Process <strong>Leave Encashment</strong> for earned/privilege leaves.</li>
                    <li>Compute <strong>Final Salary</strong>, including notice period adjustments.</li>
                    <li>Consolidate all components in <strong>Final Payment</strong> and initiate transfer.</li>
                </ol>
            </div>
        </div>
    );
}
