'use client';

import React, { useState, useEffect } from 'react';
import {
  CarbonFootprintTracker,
  EnergyConsumptionDashboard,
  WasteReductionMetrics,
  WaterUsageMonitor,
  SustainabilityScorecard,
  GreenSupplierBadges,
} from '@/components/industry4';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

type ViewType = 'carbon' | 'energy' | 'waste' | 'water' | 'scorecard' | 'suppliers';

export default function SustainabilityPage() {
  const [currentView, setCurrentView] = useState<ViewType>('scorecard');

  const views: { id: ViewType; name: string; icon: string; description: string }[] = [
    { id: 'scorecard', name: 'Sustainability Scorecard', icon: '📊', description: 'ESG KPIs & targets' },
    { id: 'carbon', name: 'Carbon Footprint', icon: '🌍', description: 'CO₂ emissions tracking' },
    { id: 'energy', name: 'Energy Consumption', icon: '⚡', description: 'Power usage & costs' },
    { id: 'waste', name: 'Waste Reduction', icon: '♻️', description: 'Recycling & efficiency' },
    { id: 'water', name: 'Water Usage', icon: '💧', description: 'Consumption monitoring' },
    { id: 'suppliers', name: 'Green Suppliers', icon: '🌿', description: 'Eco-certified vendors' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'scorecard':
        return <SustainabilityScorecard />;
      case 'carbon':
        return <CarbonFootprintTracker />;
      case 'energy':
        return <EnergyConsumptionDashboard />;
      case 'waste':
        return <WasteReductionMetrics />;
      case 'water':
        return <WaterUsageMonitor />;
      case 'suppliers':
        return <GreenSupplierBadges />;
      default:
        return <SustainabilityScorecard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Sustainability Dashboard</h1>
                <p className="text-gray-400">Industry 5.0 - Sustainable Manufacturing</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-400">ESG Score</p>
              <p className="text-2xl font-bold text-green-400">81/100</p>
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
                {currentView === 'scorecard' &&
                  'Track your organization\'s Environmental, Social, and Governance (ESG) performance. Monitor sustainability KPIs, view quarterly trends, and generate compliance reports for stakeholders.'}
                {currentView === 'carbon' &&
                  'Real-time CO₂ emissions visualization across all operations. Track Scope 1, 2, and 3 emissions, analyze product-level carbon footprints, and monitor progress toward reduction targets.'}
                {currentView === 'energy' &&
                  'Monitor power consumption patterns, renewable energy usage, and cost projections. Identify energy-saving opportunities and track efficiency improvements across facility zones.'}
                {currentView === 'waste' &&
                  'Track waste streams, recycling rates, and material efficiency. Monitor scrap reduction progress, analyze waste by type, and identify opportunities for circular economy initiatives.'}
                {currentView === 'water' &&
                  'Monitor water consumption across all operations. Track usage by zone, identify leaks, measure recycling rates, and optimize water efficiency for sustainable manufacturing.'}
                {currentView === 'suppliers' &&
                  'Evaluate supplier sustainability credentials. View eco-certifications, compare environmental performance metrics, and track your supply chain\'s green credentials.'}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm font-medium rounded-full">
                Industry 5.0
              </span>
              <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-sm font-medium rounded-full">
                Sustainable
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-900/30 rounded-xl">
          {renderContent()}
        </div>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-3 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              <span className="text-green-400 font-medium">6</span> Sustainability Components
            </span>
            <span className="text-gray-400">
              <span className="text-emerald-400 font-medium">Industry 5.0</span> - Sustainable Manufacturing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ESG Monitoring Active
            </span>
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed footer */}
      <div className="h-16" />
    </div>
  );
}
