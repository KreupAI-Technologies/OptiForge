'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Loader2, AlertCircle } from 'lucide-react'
import { SelfServiceBI, DrillThroughAnalysis, GovernedDataModels, MLForecasting, ExportScheduling, RoleBasedInsights, KPIAlerts } from '@/components/reports'
import { reportsManagementService, ReportsOverview } from '@/services/reports-management.service'

type TabId = 'self-service' | 'drill-through' | 'data-models' | 'ml-forecasting' | 'export' | 'role-based' | 'kpi-alerts';

export default function ReportsAdvancedFeaturesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('self-service');
  const [kpis, setKpis] = useState<ReportsOverview | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setKpiLoading(true);
    setKpiError(null);
    reportsManagementService
      .getReportsOverview()
      .then((data) => { if (active) setKpis(data); })
      .catch((e) => { if (active) setKpiError(e?.message ?? 'Failed to load reporting metrics'); })
      .finally(() => { if (active) setKpiLoading(false); });
    return () => { active = false; };
  }, []);
  const tabs = [
    { id: 'self-service' as TabId, label: 'Self-Service BI' },
    { id: 'drill-through' as TabId, label: 'Drill-Through' },
    { id: 'data-models' as TabId, label: 'Data Models' },
    { id: 'ml-forecasting' as TabId, label: 'ML Forecasting' },
    { id: 'export' as TabId, label: 'Export Scheduling' },
    { id: 'role-based' as TabId, label: 'Role-Based' },
    { id: 'kpi-alerts' as TabId, label: 'KPI Alerts' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'self-service': return <SelfServiceBI />;
      case 'drill-through': return <DrillThroughAnalysis />;
      case 'data-models': return <GovernedDataModels />;
      case 'ml-forecasting': return <MLForecasting />;
      case 'export': return <ExportScheduling />;
      case 'role-based': return <RoleBasedInsights />;
      case 'kpi-alerts': return <KPIAlerts />;
      default: return <SelfServiceBI />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="space-y-3">
        <div className="bg-white shadow-lg p-3">
          <button onClick={() => router.push('/reports')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="h-5 w-5" />Back to Reports
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-blue-600" />Reports & Analytics - Advanced Features
          </h1>

          {/* Live Reporting KPIs */}
          {kpiLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading live reporting metrics…
            </div>
          ) : kpiError ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {kpiError}
            </div>
          ) : kpis ? (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Report Templates', value: kpis.totalReports },
                { label: 'Favorites', value: kpis.favoriteReports },
                { label: 'Scheduled Reports', value: kpis.scheduledReports },
                { label: 'Dashboards', value: kpis.dashboards },
              ].map((k) => (
                <div key={k.label} className="rounded-lg border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50 px-3 py-2">
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-xl font-bold text-gray-900">{k.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-400">No reporting metrics available yet.</div>
          )}
        </div>
        <div className="bg-white shadow-lg">
          <nav className="flex overflow-x-auto border-b">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'px-3 py-2 border-b-2 border-blue-600 text-blue-600 font-medium whitespace-nowrap' : 'px-3 py-2 text-gray-600 whitespace-nowrap hover:text-gray-900'}>
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
