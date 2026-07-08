'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  UserPlus,
  Award,
  FileText,
  Sparkles,
  UserCheck,
  Target,
  CalendarClock,
  AlertCircle,
} from 'lucide-react';
import {
  EmployeeSelfService,
  AdvancedPayroll,
  ComplianceTracking,
  TalentAnalytics,
  OnboardingWorkflow,
  PerformanceReview,
  PolicyManagement,
} from '@/components/hr';
import { HrPagesService } from '@/services/hr-pages.service';

type TabId = 'self-service' | 'payroll' | 'compliance' | 'analytics' | 'onboarding' | 'performance' | 'policy';

interface HrSummary {
  headcount: number;
  activeEmployees: number;
  departments: number;
  pendingLeave: number;
  activeGoals: number;
  reviewsInProgress: number;
}

const isActiveStatus = (status: unknown): boolean => {
  const s = String(status ?? '').toLowerCase();
  return s === '' || s === 'active' || s === 'confirmed' || s === 'probation';
};

export default function HRAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('self-service');
  const [summary, setSummary] = useState<HrSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabId;
      if (hash) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load a real HR summary from the NestJS HR backend.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const [employees, departments, leaves, goals, reviews] = await Promise.all([
          HrPagesService.employees<any[]>().catch(() => []),
          HrPagesService.departments<any[]>().catch(() => []),
          HrPagesService.leaveApplications<any[]>().catch(() => []),
          HrPagesService.performanceGoals<any[]>().catch(() => []),
          HrPagesService.performanceReviews<any[]>().catch(() => []),
        ]);

        const emp = Array.isArray(employees) ? employees : [];
        const dept = Array.isArray(departments) ? departments : [];
        const lv = Array.isArray(leaves) ? leaves : [];
        const gl = Array.isArray(goals) ? goals : [];
        const rv = Array.isArray(reviews) ? reviews : [];

        const next: HrSummary = {
          headcount: emp.length,
          activeEmployees: emp.filter((e) => isActiveStatus(e?.status ?? e?.employmentStatus)).length,
          departments: dept.length,
          pendingLeave: lv.filter((l) => String(l?.status ?? '').toLowerCase() === 'pending').length,
          activeGoals: gl.filter((g) => {
            const s = String(g?.status ?? g?.data?.status ?? '').toLowerCase();
            return s === '' || s === 'active' || s === 'in_progress' || s === 'in-progress';
          }).length,
          reviewsInProgress: rv.filter((r) => {
            const s = String(r?.status ?? '').toLowerCase();
            return s !== 'completed' && s !== 'acknowledged' && s !== 'closed';
          }).length,
        };
        if (!cancelled) setSummary(next);
      } catch (err) {
        if (!cancelled) {
          setSummaryError(err instanceof Error ? err.message : 'Failed to load HR summary');
        }
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: 'self-service', label: 'Employee Self-Service', icon: Users, component: EmployeeSelfService },
    { id: 'payroll', label: 'Advanced Payroll', icon: DollarSign, component: AdvancedPayroll },
    { id: 'compliance', label: 'Compliance Tracking', icon: Shield, component: ComplianceTracking },
    { id: 'analytics', label: 'Talent Analytics', icon: TrendingUp, component: TalentAnalytics },
    { id: 'onboarding', label: 'Onboarding Workflow', icon: UserPlus, component: OnboardingWorkflow },
    { id: 'performance', label: 'Performance Review', icon: Award, component: PerformanceReview },
    { id: 'policy', label: 'Policy Management', icon: FileText, component: PolicyManagement },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || EmployeeSelfService;

  const kpiCards = [
    { key: 'headcount', label: 'Total Headcount', value: summary?.headcount ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'active', label: 'Active Employees', value: summary?.activeEmployees ?? 0, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'departments', label: 'Departments', value: summary?.departments ?? 0, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { key: 'pendingLeave', label: 'Pending Leave', value: summary?.pendingLeave ?? 0, icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { key: 'goals', label: 'Active Goals', value: summary?.activeGoals ?? 0, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'reviews', label: 'Reviews In Progress', value: summary?.reviewsInProgress ?? 0, icon: Award, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="h-full flex flex-col px-2 py-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR Advanced Features</h1>
              <p className="text-sm text-gray-600">Enterprise HCM capabilities for modern workforce management</p>
            </div>
          </div>
        </div>

        {/* Live HR Summary KPIs */}
        <div className="mb-2">
          {summaryError ? (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Unable to load live HR summary: {summaryError}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {kpiCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                        <Icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <span className="text-xs text-gray-500 leading-tight">{card.label}</span>
                    </div>
                    {summaryLoading ? (
                      <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-2">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabId);
                    window.location.hash = tab.id;
                  }}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-purple-600 bg-purple-50'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
