'use client';

import React, { useState, useEffect } from 'react';
import {
  PersonalizedDashboard,
  RoleBasedViews,
  OperatorWorkstation,
  SkillMatrixVisualization,
  WorkloadBalanceCharts,
  ErgonomicAlerts,
} from '@/components/industry4';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

type ViewType = 'personalized' | 'role-based' | 'workstation' | 'skills' | 'workload' | 'ergonomics';

export default function HumanCentricPage() {
  const [currentView, setCurrentView] = useState<ViewType>('personalized');

  const [skillMatrices, setSkillMatrices] = useState<any[]>([]);
  const [smLoading, setSmLoading] = useState(true);
  const [smError, setSmError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSmLoading(true);
      setSmError(null);
      try {
        const raw = await ProductionOrphanService.getSkillMatrices();
        if (!cancelled) setSkillMatrices(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) {
          setSmError(err instanceof Error ? err.message : 'Failed to load skill matrix records');
          setSkillMatrices([]);
        }
      } finally {
        if (!cancelled) setSmLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const views: { id: ViewType; name: string; icon: string; description: string }[] = [
    { id: 'personalized', name: 'Personalized Dashboard', icon: '🎨', description: 'Customizable widget layout' },
    { id: 'role-based', name: 'Role-Based Views', icon: '👔', description: 'Pre-configured interfaces' },
    { id: 'workstation', name: 'Operator Workstation', icon: '🏭', description: 'Shop floor interface' },
    { id: 'skills', name: 'Skill Matrix', icon: '📊', description: 'Skills gap analysis' },
    { id: 'workload', name: 'Workload Balance', icon: '⚖️', description: 'Team distribution' },
    { id: 'ergonomics', name: 'Ergonomic Alerts', icon: '🧘', description: 'Wellness & breaks' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'personalized':
        return <PersonalizedDashboard />;
      case 'role-based':
        return <RoleBasedViews currentRole="supervisor" userName="Demo User" />;
      case 'workstation':
        return <OperatorWorkstation operatorName="Shop Floor Operator" />;
      case 'skills':
        return <SkillMatrixVisualization />;
      case 'workload':
        return <WorkloadBalanceCharts />;
      case 'ergonomics':
        return <ErgonomicAlerts employeeName="Demo User" />;
      default:
        return <PersonalizedDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">👥</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Human-Centric Design</h1>
                <p className="text-gray-400">Industry 5.0 - People-focused manufacturing interfaces</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-400">Feature Category</p>
              <p className="text-white font-medium">Industry 5.0 - Human-Centric</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                currentView === view.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{view.icon}</span>
              <div className="text-left">
                <p className="font-medium">{view.name}</p>
                <p className={`text-xs ${currentView === view.id ? 'text-green-200' : 'text-gray-500'}`}>
                  {view.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Feature Info Card */}
        <div className="mb-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{views.find(v => v.id === currentView)?.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {views.find(v => v.id === currentView)?.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {currentView === 'personalized' &&
                  'Drag-and-drop widget customization allows each user to arrange their dashboard according to their preferences and role. Save custom layouts and quickly access the metrics that matter most to you.'}
                {currentView === 'role-based' &&
                  'Pre-configured interfaces optimized for different roles: Operators see job-focused views, Supervisors get team management tools, Managers access analytics, and Executives view strategic dashboards.'}
                {currentView === 'workstation' &&
                  'Simplified touch-friendly interface designed for shop floor use. Large buttons, clear status indicators, and quick actions make it easy to log production data, report issues, and manage jobs.'}
                {currentView === 'skills' &&
                  'Visualize the gap between current employee skills and required competencies. Identify training needs, track certifications, and plan workforce development initiatives.'}
                {currentView === 'workload' &&
                  'Monitor team workload distribution to identify overloaded or underutilized team members. Balance assignments for optimal productivity and employee wellbeing.'}
                {currentView === 'ergonomics' &&
                  'Proactive wellness alerts for break reminders, posture corrections, and fatigue warnings. Integrates with IoT sensors for real-time ergonomic monitoring on the shop floor.'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm font-medium rounded-full">
                Industry 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={currentView === 'workstation' ? '' : 'bg-gray-900/30 rounded-xl'}>
          {renderContent()}
        </div>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-3 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              <span className="text-green-400 font-medium">6</span> Human-Centric Components
            </span>
            <span className="text-gray-400">
              <span className="text-blue-400 font-medium">Industry 5.0</span> - Sustainable & People-First
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed footer */}
      <div className="h-16" />
    </div>
  );
}
