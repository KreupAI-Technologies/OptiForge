'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Headphones, Loader2, AlertCircle } from 'lucide-react'
import { OmnichannelRouting, KnowledgeBaseIntegration, AIAssistedResponses, SLAAutomation, CSATSurveys, BacklogForecasting, ITILWorkflows } from '@/components/support'
import { supportPagesService, SupportOverview } from '@/services/support-pages.service'

type TabId = 'omnichannel' | 'knowledge' | 'ai' | 'sla' | 'csat' | 'backlog' | 'itil';

export default function SupportAdvancedFeaturesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('omnichannel');
  const [kpis, setKpis] = useState<SupportOverview | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setKpiLoading(true);
    setKpiError(null);
    supportPagesService
      .getSupportOverview()
      .then((data) => { if (active) setKpis(data); })
      .catch((e) => { if (active) setKpiError(e?.message ?? 'Failed to load support metrics'); })
      .finally(() => { if (active) setKpiLoading(false); });
    return () => { active = false; };
  }, []);
  const tabs = [
    { id: 'omnichannel' as TabId, label: 'Omnichannel' },
    { id: 'knowledge' as TabId, label: 'Knowledge Base' },
    { id: 'ai' as TabId, label: 'AI Responses' },
    { id: 'sla' as TabId, label: 'SLA' },
    { id: 'csat' as TabId, label: 'CSAT' },
    { id: 'backlog' as TabId, label: 'Backlog' },
    { id: 'itil' as TabId, label: 'ITIL' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'omnichannel': return <OmnichannelRouting />;
      case 'knowledge': return <KnowledgeBaseIntegration />;
      case 'ai': return <AIAssistedResponses />;
      case 'sla': return <SLAAutomation />;
      case 'csat': return <CSATSurveys />;
      case 'backlog': return <BacklogForecasting />;
      case 'itil': return <ITILWorkflows />;
      default: return <OmnichannelRouting />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="space-y-3">
        <div className="bg-white shadow-lg p-3">
          <button onClick={() => router.push('/support')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="h-5 w-5" />Back to Support
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Headphones className="h-10 w-10 text-blue-600" />Support Advanced Features
          </h1>

          {/* Live Support KPIs (SLA compliance dashboard) */}
          {kpiLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading live support metrics…
            </div>
          ) : kpiError ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {kpiError}
            </div>
          ) : kpis ? (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { label: 'Tickets (30d)', value: kpis.totalTickets },
                { label: 'SLA Breached', value: kpis.breachedTickets },
                { label: 'SLA Compliance', value: `${kpis.complianceRate}%` },
                { label: 'Active Policies', value: kpis.activePolicies },
                { label: 'Breaches (30d)', value: kpis.breachesLast30Days },
              ].map((k) => (
                <div key={k.label} className="rounded-lg border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50 px-3 py-2">
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-xl font-bold text-gray-900">{k.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-400">No support metrics available yet.</div>
          )}
        </div>
        <div className="bg-white shadow-lg">
          <nav className="flex overflow-x-auto border-b">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'px-3 py-2 border-b-2 border-blue-600 text-blue-600' : 'px-3 py-2 text-gray-600'}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
}
