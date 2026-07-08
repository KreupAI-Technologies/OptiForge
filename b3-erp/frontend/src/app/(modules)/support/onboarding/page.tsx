'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Circle, ArrowRight, Play, FileText, Users, Settings, Database, Shield, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supportPagesService, OnboardingTask } from '@/services/support-pages.service';

export default function OnboardingPage() {
    const [tasks, setTasks] = useState<OnboardingTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        supportPagesService
            .getOnboardingTasks()
            .then((data) => { if (active) setTasks(Array.isArray(data) ? data : []); })
            .catch((e) => { if (active) setError(e?.message ?? 'Failed to load onboarding tasks'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const toggleStatus = async (id: string) => {
        const target = tasks.find((t) => t.id === id);
        if (!target) return;
        const newStatus: OnboardingTask['status'] =
            target.status === 'completed' ? 'pending' : 'completed';
        // Optimistic update
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
        try {
            await supportPagesService.updateOnboardingTask(id, { status: newStatus });
        } catch {
            // Revert on failure
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: target.status } : t)));
        }
    };

    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/support" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Onboarding Checklist</h1>
                        <p className="text-gray-600 mt-1">Track your setup progress and get started quickly</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{progress}% Complete</p>
                        <p className="text-xs text-gray-500">{completedCount} of {tasks.length} tasks</p>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={126}
                                strokeDashoffset={126 - (126 * progress) / 100}
                                className="text-green-500 transition-all duration-500 ease-out"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task List */}
                <div className="lg:col-span-2 space-y-2">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-xl p-6 border border-gray-200">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading onboarding tasks…
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-white rounded-xl p-6 border border-red-200">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-sm text-gray-400 bg-white rounded-xl p-6 border border-gray-200">
                            No onboarding tasks found.
                        </div>
                    ) : (
                        tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`bg-white rounded-xl p-3 border transition-all duration-200 ${task.status === 'completed' ? 'border-green-200 bg-green-50/30' :
                                    task.status === 'in_progress' ? 'border-blue-200 shadow-md transform scale-[1.01]' :
                                        'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <button
                                    onClick={() => toggleStatus(task.id)}
                                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                            'border-gray-300 hover:border-blue-500 text-transparent'
                                        }`}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {task.title}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${task.category === 'setup' ? 'bg-blue-100 text-blue-700' :
                                                task.category === 'security' ? 'bg-red-100 text-red-700' :
                                                    task.category === 'data' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {task.category.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{task.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Play className="w-3 h-3" />
                                            {task.estimatedTime}
                                        </span>
                                        {task.status === 'in_progress' && (
                                            <span className="text-blue-600 font-medium animate-pulse">In Progress...</span>
                                        )}
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                    )}
                </div>

                {/* Resources Sidebar */}
                <div className="space-y-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                        <h3 className="font-bold text-gray-900 mb-2">Helpful Resources</h3>
                        <div className="space-y-2">
                            <Link href="/support/knowledge" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Documentation</p>
                                    <p className="text-xs text-gray-500">Detailed guides & API docs</p>
                                </div>
                            </Link>
                            <Link href="/support/tickets" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Contact Support</p>
                                    <p className="text-xs text-gray-500">Get help from our team</p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200">
                                    <Play className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Video Tutorials</p>
                                    <p className="text-xs text-gray-500">Watch step-by-step guides</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 text-white">
                        <h3 className="font-bold text-lg mb-2">Need Assistance?</h3>
                        <p className="text-blue-100 text-sm mb-2">
                            Our onboarding specialists are available to help you set up your account.
                        </p>
                        <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                            Schedule a Call
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
