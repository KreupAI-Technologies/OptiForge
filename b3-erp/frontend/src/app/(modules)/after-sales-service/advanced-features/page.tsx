'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wrench, Ticket, Activity, ShieldCheck, CalendarClock, Loader2, AlertCircle } from 'lucide-react'
import { LiveSLATracking, TechnicianRouting, SparePartsIntegration, ServiceDispatch, AutomatedEscalations, SelfServicePortal, CustomerFeedbackLoop } from '@/components/after-sales-service'
import { AfterSalesPagesService, AfterSalesOverviewStats } from '@/services/after-sales-pages.service'

type TabId = 'sla' | 'routing' | 'parts' | 'dispatch' | 'escalations' | 'feedback';

export default function AfterSalesAdvancedFeaturesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('sla');
  const [stats, setStats] = useState<AfterSalesOverviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Live after-sales summary KPIs from the overview endpoint
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const overview = await AfterSalesPagesService.overview();
        if (!cancelled) setStats(overview?.stats ?? null);
      } catch (err) {
        if (!cancelled) setStatsError(err instanceof Error ? err.message : 'Failed to load after-sales metrics');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const tabs = [
    { id: 'sla' as TabId, label: 'Live SLA' },
    { id: 'routing' as TabId, label: 'Technician Routing' },
    { id: 'parts' as TabId, label: 'Spare Parts' },
    { id: 'dispatch' as TabId, label: 'Service Dispatch' },
    { id: 'escalations' as TabId, label: 'Escalations' },
    { id: 'feedback' as TabId, label: 'Feedback' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'sla': return <LiveSLATracking />;
      case 'routing': return <TechnicianRouting />;
      case 'parts': return <SparePartsIntegration />;
      case 'dispatch': return <ServiceDispatch />;
      case 'escalations': return <AutomatedEscalations />;
      case 'feedback': return <CustomerFeedbackLoop />;
      default: return <LiveSLATracking />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-3">
      <div className="w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div>
              <button onClick={() => router.push('/after-sales-service')} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-widest transition-all hover:gap-2 mb-1">
                <ArrowLeft className="h-4 w-4" /> Back to After-Sales Service
              </button>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Advanced Service Suite
              </h1>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-white shadow-lg text-blue-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live After-Sales KPIs */}
        {statsLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading after-sales metrics…
          </div>
        ) : statsError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl p-5">
            <AlertCircle className="h-4 w-4" /> {statsError}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Tickets</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalTickets}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.openTickets} open</p>
                </div>
                <Ticket className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Service Calls</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{stats.activeServiceCalls}</p>
                  <p className="text-xs text-slate-500 mt-1">in progress</p>
                </div>
                <Activity className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Warranty Claims</p>
                  <p className="text-3xl font-black text-purple-600 mt-1">{stats.warrantyClaimsThisMonth}</p>
                  <p className="text-xs text-slate-500 mt-1">this month</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Scheduled Visits</p>
                  <p className="text-3xl font-black text-orange-600 mt-1">{stats.scheduledVisits}</p>
                  <p className="text-xs text-slate-500 mt-1">upcoming field jobs</p>
                </div>
                <CalendarClock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
