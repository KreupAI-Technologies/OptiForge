'use client'

import { useState, useEffect } from 'react'
import { Zap, Map, Award, TrendingUp, Link2, DollarSign, BarChart3, Rocket, ShoppingCart, Users } from 'lucide-react'

import {
  QuoteToOrderAutomation,
  TerritoryManagement,
  IncentiveTracking,
  PredictiveForecasting,
  CPQHandoff,
  RevenueRecognition,
  PipelineAnalytics
} from '@/components/sales'
import { salesAnalyticsService, SalesAnalyticsDashboard } from '@/services/sales-analytics.service'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  component: React.ComponentType
}

export default function SalesAdvancedFeatures() {
  const [activeTab, setActiveTab] = useState<string>('automation')

  // Live sales overview KPIs
  const [dashboard, setDashboard] = useState<SalesAnalyticsDashboard | null>(null)
  const [dashLoading, setDashLoading] = useState(true)
  const [dashError, setDashError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setDashLoading(true)
    setDashError(null)
    salesAnalyticsService
      .getDashboard()
      .then((data) => {
        if (active) setDashboard(data ?? null)
      })
      .catch((err) => {
        if (active) setDashError(err?.message || 'Failed to load sales overview')
      })
      .finally(() => {
        if (active) setDashLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = dashboard?.currentStats

  const tabs: Tab[] = [
    { id: 'automation', label: 'Quote-to-Order', icon: Zap, component: QuoteToOrderAutomation },
    { id: 'territory', label: 'Territory Mgmt', icon: Map, component: TerritoryManagement },
    { id: 'incentive', label: 'Incentives', icon: Award, component: IncentiveTracking },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp, component: PredictiveForecasting },
    { id: 'cpq', label: 'CPQ Handoff', icon: Link2, component: CPQHandoff },
    { id: 'revenue', label: 'Revenue Recognition', icon: DollarSign, component: RevenueRecognition },
    { id: 'pipeline', label: 'Pipeline Analytics', icon: BarChart3, component: PipelineAnalytics }
  ]

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && tabs.find(t => t.id === hash)) {
      setActiveTab(hash)
    }
  }, [])

  useEffect(() => {
    window.location.hash = activeTab
  }, [activeTab])

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || QuoteToOrderAutomation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <div className="space-y-3">
        <div className="bg-white shadow-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Rocket className="h-10 w-10 text-orange-600" />
                Sales Advanced Features
              </h1>
              <p className="text-gray-600">
                Enterprise-grade sales automation with quote-to-order workflows, territory management, predictive forecasting, and revenue recognition
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg p-3">
          {dashLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : dashError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Unable to load live sales overview. {dashError}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <DollarSign className="h-4 w-4" /> Revenue
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  ₹{(stats.revenue ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <ShoppingCart className="h-4 w-4" /> Orders
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {(stats.orders ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <Users className="h-4 w-4" /> Customers
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {(stats.customers ?? 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <TrendingUp className="h-4 w-4" /> Conversion
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {(stats.conversionRate ?? 0).toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No sales overview data available.</div>
          )}
        </div>

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
                      ? 'border-orange-600 text-orange-600 bg-orange-50'
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

        <div className="p-6">
          <ActiveComponent />
        </div>

        <div className="bg-white shadow-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            Sales Advanced Features • Quote automation, territory planning, commission tracking, predictive analytics, CPQ integration, revenue recognition, and pipeline visualization
          </p>
        </div>
      </div>
    </div>
  )
}
