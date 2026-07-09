'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Globe,
  Shield,
  CheckCircle,
  Wallet,
  TrendingUp,
  Lock,
  Calculator,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';
import EmptyState from '@/components/ui/EmptyState';

type FeatureId =
  | 'general-ledger'
  | 'consolidation'
  | 'audit-trail'
  | 'compliance'
  | 'treasury'
  | 'cash-forecast'
  | 'controls';

export default function FinanceAdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<FeatureId>('general-ledger');

  const [featureToggles, setFeatureToggles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await FinanceService.getAdvancedFeatures();
        if (cancelled) return;
        setFeatureToggles(Array.isArray(raw) ? raw : []);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load advanced features');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allFeatures: Array<{
    id: FeatureId;
    name: string;
    icon: LucideIcon;
    color: string;
    bg: string;
  }> = [
    { id: 'general-ledger', name: 'General Ledger & Journals', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'consolidation', name: 'Multi-Entity Consolidation', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'audit-trail', name: 'Advanced Audit Trail', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'compliance', name: 'Compliance Automation', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'treasury', name: 'Treasury Management', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'cash-forecast', name: 'Predictive Cash Forecasting', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'controls', name: 'Financial Controls', icon: Lock, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  // When backend feature toggles are present, only show the features enabled there;
  // otherwise show all features unchanged.
  const features = featureToggles.length
    ? allFeatures.filter((feature) =>
        featureToggles.some(
          (t: any) => t.featureKey === feature.id && t.isEnabled !== false,
        ),
      )
    : allFeatures;

  const isFeatureEnabled = (id: FeatureId) =>
    featureToggles.length === 0 ||
    featureToggles.some((t: any) => t.featureKey === id && t.isEnabled !== false);

  const getFeatureDescription = (id: FeatureId) => {
    const descriptions: Record<FeatureId, string> = {
      'general-ledger': 'Real-time general ledger with journal entries, trial balance, and chart of accounts. Full double-entry bookkeeping with automated posting.',
      'consolidation': 'Multi-entity consolidation with intercompany elimination, currency translation, and minority interest calculation.',
      'audit-trail': 'Comprehensive audit logging with field-level change tracking, user activity monitoring, and tamper-proof records.',
      'compliance': 'Automated compliance monitoring with rule-based checks, regulatory reporting, and evidence management.',
      'treasury': 'Cash, investment, and liability management with real-time balances and position analysis.',
      'cash-forecast': 'AI-powered cash flow forecasting with scenario modeling, driver analysis, and confidence intervals.',
      'controls': 'Internal controls framework with segregation of duties, approval workflows, and violation tracking.'
    };
    return descriptions[id];
  };

  // Honest empty-state copy per tab. No real backend data source exists yet for
  // these areas, so we surface a "not yet connected" state instead of fabricated
  // financial figures.
  const getEmptyStateCopy = (id: FeatureId): { title: string; description: string } => {
    const copy: Record<FeatureId, { title: string; description: string }> = {
      'general-ledger': {
        title: 'General Ledger data source not yet connected',
        description: 'Accounts, journal entries, and trial balance will appear here once the general ledger data source is connected.'
      },
      'consolidation': {
        title: 'Consolidation data source not yet connected',
        description: 'Entity statements, intercompany eliminations, and consolidated results will appear here once the consolidation data source is connected.'
      },
      'audit-trail': {
        title: 'Audit Trail data source not yet connected',
        description: 'Field-level change logs and user activity records will appear here once the audit trail data source is connected.'
      },
      'compliance': {
        title: 'Compliance data source not yet connected',
        description: 'Compliance rules, checks, and regulatory reports will appear here once the compliance data source is connected.'
      },
      'treasury': {
        title: 'Treasury data source not yet connected',
        description: 'Bank accounts, investments, liabilities, and cash position will appear here once the treasury data source is connected.'
      },
      'cash-forecast': {
        title: 'Cash Forecasting data source not yet connected',
        description: 'Cash flow projections, drivers, and scenarios will appear here once the forecasting data source is connected.'
      },
      'controls': {
        title: 'Financial Controls',
        description: ''
      }
    };
    return copy[id];
  };

  const activeFeature = features.find((f) => f.id === activeTab);
  const HeaderIcon = activeFeature?.icon || Calculator;

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="h-full flex flex-col px-2 py-2">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Finance Advanced Features</h1>
          <p className="text-sm text-gray-600">
            Enterprise-grade financial management tools for comprehensive accounting, compliance, and treasury operations
          </p>
          {isLoading && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
              Loading…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {loadError}
            </div>
          )}
        </div>

        {/* Feature Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-3 overflow-hidden flex-shrink-0">
          <div className="border-b border-gray-200 p-2 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === feature.id
                        ? `${feature.bg} ${feature.color} shadow-md`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {feature.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Description */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${activeFeature?.bg}`}>
                <HeaderIcon className={`w-6 h-6 ${activeFeature?.color}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {activeFeature?.name}
                </h2>
                <p className="text-sm text-gray-600">{getFeatureDescription(activeTab)}</p>
                {!isLoading && !isFeatureEnabled(activeTab) && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                    Disabled for this tenant
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex-1 overflow-auto">
          {activeTab === 'controls' ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="mb-2 p-3 rounded-full bg-gray-100">
                <Lock className="w-16 h-16 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Controls Module</h3>
              <p className="text-gray-600">
                Access the complete Financial Controls module at{' '}
                <a href="/finance/controls" className="text-blue-600 hover:underline">
                  /finance/controls
                </a>
              </p>
            </div>
          ) : (
            <EmptyState
              icon={activeFeature?.icon || Calculator}
              title={getEmptyStateCopy(activeTab).title}
              description={getEmptyStateCopy(activeTab).description}
              size="md"
            />
          )}
        </div>
      </div>
    </div>
  );
}
