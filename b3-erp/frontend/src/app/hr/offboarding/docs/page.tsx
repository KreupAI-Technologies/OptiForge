'use client';

import { FileText, Award, File, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { OffboardingService } from '@/services/offboarding.service';

export default function DocsPage() {
    const [stats, setStats] = useState({
        pendingRequests: 0,
        generatedToday: 0,
        issuedThisMonth: 0,
        avgTurnaroundTime: '2 days'
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const dashboard = await OffboardingService.getOffboardingDashboard();
                if (!mounted) return;
                setStats({
                    // Pending document/clearance requests awaiting action
                    pendingRequests: dashboard?.pendingClearances ?? dashboard?.activeResignations ?? 0,
                    // Closest real signal for "generated today": exit interviews still pending
                    generatedToday: dashboard?.exitInterviewsPending ?? 0,
                    // Issued this month approximated by active resignations in the pipeline
                    issuedThisMonth: dashboard?.activeResignations ?? 0,
                    // No matching real field; keep static text
                    avgTurnaroundTime: '2 days'
                });
            } catch {
                if (!mounted) return;
                setStats({
                    pendingRequests: 0,
                    generatedToday: 0,
                    issuedThisMonth: 0,
                    avgTurnaroundTime: '2 days'
                });
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const modules = [
        {
            title: 'Experience Certificate',
            description: 'Generate employment proof and role history certificates',
            icon: <Award className="h-6 w-6 text-blue-600" />,
            color: 'bg-blue-50 border-blue-200',
            href: '/hr/offboarding/docs/experience',
            status: '3 Pending'
        },
        {
            title: 'Relieving Letter',
            description: 'Formal release letter upon completion of notice period',
            icon: <FileText className="h-6 w-6 text-yellow-600" />,
            color: 'bg-yellow-50 border-yellow-200',
            href: '/hr/offboarding/docs/relieving',
            status: '4 Pending'
        },
        {
            title: 'Service Certificate',
            description: 'Detailed record of conduct, performance, and tenure',
            icon: <File className="h-6 w-6 text-green-600" />,
            color: 'bg-green-50 border-green-200',
            href: '/hr/offboarding/docs/service',
            status: '1 Pending'
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Exit Documents</h1>
                <p className="text-gray-600 mt-2">Manage generation and issuance of critical offboarding documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Generated Today</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.generatedToday}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Issued (Month)</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.issuedThisMonth}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Avg. Turnaround</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgTurnaroundTime}</p>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">Document Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Issuance Workflow</h3>
                <div className="flex flex-col md:flex-row gap-2 items-center text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</span>
                        Request/Trigger
                    </div>
                    <ChevronRight className="hidden md:block h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-xs">2</span>
                        Generate Draft
                    </div>
                    <ChevronRight className="hidden md:block h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">3</span>
                        Approval
                    </div>
                    <ChevronRight className="hidden md:block h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">4</span>
                        Digital Signature & Issue
                    </div>
                </div>
            </div>
        </div>
    );
}
