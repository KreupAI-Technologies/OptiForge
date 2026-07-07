'use client'

import { useState, useEffect } from 'react'
import { Users, Award, BarChart3, GitBranch, FileText, Gavel, FileSignature, Rocket, Send, Trophy } from 'lucide-react'

import {
  VendorCollaboration,
  ResponseScoring,
  BidComparison,
  ApprovalWorkflow,
  AuditTrail,
  SourcingIntegration,
  ContractGeneration
} from '@/components/rfq'
import { procurementRFQService, ProcurementRFQ } from '@/services/procurement-rfq.service'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  component: React.ComponentType
}

export default function RFQAdvancedFeatures() {
  const [activeTab, setActiveTab] = useState<string>('collaboration')

  // Live RFQ overview KPIs (derived from the procurement RFQ list)
  const [rfqs, setRfqs] = useState<ProcurementRFQ[]>([])
  const [rfqLoading, setRfqLoading] = useState(true)
  const [rfqError, setRfqError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setRfqLoading(true)
    setRfqError(null)
    procurementRFQService
      .getAllRFQs()
      .then((res) => {
        if (active) setRfqs(Array.isArray(res?.data) ? res.data : [])
      })
      .catch((err) => {
        if (active) setRfqError(err?.message || 'Failed to load RFQ overview')
      })
      .finally(() => {
        if (active) setRfqLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const rfqStats = {
    total: rfqs.length,
    active: rfqs.filter((r) => ['Sent', 'Responses Received', 'Under Evaluation'].includes(r.status)).length,
    awarded: rfqs.filter((r) => r.status === 'Awarded').length,
    responses: rfqs.reduce((sum, r) => sum + (Array.isArray(r.quotes) ? r.quotes.length : 0), 0),
  }

  const tabs: Tab[] = [
    { id: 'collaboration', label: 'Vendor Collaboration', icon: Users, component: VendorCollaboration },
    { id: 'scoring', label: 'Response Scoring', icon: Award, component: ResponseScoring },
    { id: 'comparison', label: 'Bid Comparison', icon: BarChart3, component: BidComparison },
    { id: 'approval', label: 'Approval Workflow', icon: GitBranch, component: ApprovalWorkflow },
    { id: 'audit', label: 'Audit Trail', icon: FileText, component: AuditTrail },
    { id: 'sourcing', label: 'Sourcing Integration', icon: Gavel, component: SourcingIntegration },
    { id: 'contract', label: 'Contract Generation', icon: FileSignature, component: ContractGeneration }
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

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || VendorCollaboration

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="space-y-3">
        <div className="bg-white shadow-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Rocket className="h-10 w-10 text-blue-600" />
                RFQ Advanced Features
              </h1>
              <p className="text-gray-600">
                Enterprise procurement with vendor collaboration, response scoring, automated comparison, and contract generation
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg p-3">
          {rfqLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : rfqError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Unable to load live RFQ overview. {rfqError}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <FileText className="h-4 w-4" /> Total RFQs
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{rfqStats.total.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <Send className="h-4 w-4" /> Active
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{rfqStats.active.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <Users className="h-4 w-4" /> Vendor Responses
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{rfqStats.responses.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                  <Trophy className="h-4 w-4" /> Awarded
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{rfqStats.awarded.toLocaleString()}</div>
              </div>
            </div>
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

        <div className="p-6">
          <ActiveComponent />
        </div>

        <div className="bg-white shadow-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            RFQ Advanced Features • Vendor portals, weighted scoring, bid analytics, multi-level approvals, audit logging, sourcing events, and contract automation
          </p>
        </div>
      </div>
    </div>
  )
}
