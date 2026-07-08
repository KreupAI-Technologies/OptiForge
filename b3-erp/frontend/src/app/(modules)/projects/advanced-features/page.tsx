'use client'

import { useState, useEffect } from 'react'
import {
  Gauge,
  GitBranch,
  DollarSign,
  Users,
  FileEdit,
  MessageSquare,
  Rocket,
  Flag,
  Loader2,
  AlertCircle
} from 'lucide-react'

import {
  ProjectHealthScoring,
  CrossProjectDependencies,
  FinancialRollup,
  ResourceLeveling,
  ChangeControl,
  StakeholderCommunication
} from '@/components/projects'
import { projectManagementService } from '@/services/ProjectManagementService'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  component: React.ComponentType
}

interface PortfolioKpis {
  projects: number
  activeProjects: number
  milestones: number
  resources: number
}

export default function ProjectsAdvancedFeatures() {
  const [activeTab, setActiveTab] = useState<string>('health')
  const [kpis, setKpis] = useState<PortfolioKpis | null>(null)
  const [kpiLoading, setKpiLoading] = useState(true)
  const [kpiError, setKpiError] = useState<string | null>(null)

  // Live portfolio KPIs from project-management endpoints
  useEffect(() => {
    let cancelled = false
    const loadKpis = async () => {
      setKpiLoading(true)
      setKpiError(null)
      try {
        const [plans, milestones, resources] = await Promise.all([
          projectManagementService.listProjectPlans().catch(() => [] as any[]),
          projectManagementService.listAllMilestones().catch(() => [] as any[]),
          projectManagementService.listAllResources().catch(() => [] as any[]),
        ])
        if (cancelled) return
        const planArr = Array.isArray(plans) ? plans : []
        const activeProjects = planArr.filter((p: any) => {
          const s = String(p?.status ?? '').toLowerCase()
          return s === 'in_execution' || s === 'approved' || s === 'active'
        }).length
        setKpis({
          projects: planArr.length,
          activeProjects,
          milestones: Array.isArray(milestones) ? milestones.length : 0,
          resources: Array.isArray(resources) ? resources.length : 0,
        })
      } catch (err) {
        if (!cancelled) setKpiError(err instanceof Error ? err.message : 'Failed to load portfolio KPIs')
      } finally {
        if (!cancelled) setKpiLoading(false)
      }
    }
    loadKpis()
    return () => { cancelled = true }
  }, [])

  const tabs: Tab[] = [
    { id: 'health', label: 'Project Health', icon: Gauge, component: ProjectHealthScoring },
    { id: 'dependencies', label: 'Dependencies', icon: GitBranch, component: CrossProjectDependencies },
    { id: 'financial', label: 'Financial Rollup', icon: DollarSign, component: FinancialRollup },
    { id: 'resources', label: 'Resource Leveling', icon: Users, component: ResourceLeveling },
    { id: 'changes', label: 'Change Control', icon: FileEdit, component: ChangeControl },
    { id: 'stakeholders', label: 'Stakeholder Hub', icon: MessageSquare, component: StakeholderCommunication }
  ]

  // Handle hash-based navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && tabs.find(t => t.id === hash)) {
      setActiveTab(hash)
    }
  }, [])

  useEffect(() => {
    window.location.hash = activeTab
  }, [activeTab])

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ProjectHealthScoring

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white shadow-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Rocket className="h-10 w-10 text-blue-600" />
                Projects Advanced Features
              </h1>
              <p className="text-gray-600">
                Enterprise-grade project portfolio management with real-time health scoring, cross-project dependencies, and financial rollup
              </p>
            </div>
          </div>
        </div>

        {/* Live Portfolio KPIs */}
        <div className="px-3">
          {kpiLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white shadow-sm rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading portfolio metrics…
            </div>
          ) : kpiError ? (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" /> {kpiError}
            </div>
          ) : kpis ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Project Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{kpis.projects}</p>
                  </div>
                  <Rocket className="h-7 w-7 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Active Projects</p>
                    <p className="text-2xl font-bold text-green-600">{kpis.activeProjects}</p>
                  </div>
                  <Gauge className="h-7 w-7 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Milestones</p>
                    <p className="text-2xl font-bold text-purple-600">{kpis.milestones}</p>
                  </div>
                  <Flag className="h-7 w-7 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Resources</p>
                    <p className="text-2xl font-bold text-orange-600">{kpis.resources}</p>
                  </div>
                  <Users className="h-7 w-7 text-orange-500" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-md">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <ActiveComponent />
        </div>

        {/* Footer */}
        <div className="bg-white shadow-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            Projects Advanced Features • Real-time health scoring, dependency tracking, financial consolidation, resource optimization, change management, and stakeholder engagement
          </p>
        </div>
      </div>
    </div>
  )
}
