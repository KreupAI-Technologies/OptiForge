'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Phone, Mail, Calendar, User, Building2, DollarSign, Target, TrendingUp, Clock } from 'lucide-react'
import { CRMToSalesConnections, type CRMToSalesConnection } from '@/components/inter-module/ModuleConnections'
import { useToast } from '@/components/ui'
import { crmService, asArray } from '@/services/crm.service'

interface OpportunityDetail {
  id: string
  name: string
  account: string
  stage: string
  amount: number
  probability: number
  expectedCloseDate: string
  owner: string
  createdAt: string
  description: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  nextStep: string
  competitorInfo: string
}

interface TimelineActivity {
  date: string
  type: string
  description: string
  user: string
}

const emptyOpportunity: OpportunityDetail = {
  id: '',
  name: '',
  account: '',
  stage: 'prospecting',
  amount: 0,
  probability: 0,
  expectedCloseDate: '',
  owner: '',
  createdAt: '',
  description: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  nextStep: '',
  competitorInfo: '',
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const opportunityId = params.id as string

  const [opportunity, setOpportunity] = useState<OpportunityDetail>(emptyOpportunity)
  const [timeline, setTimeline] = useState<TimelineActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!opportunityId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const raw: any = await crmService.opportunities.getById(opportunityId)
        if (!cancelled && raw && typeof raw === 'object') {
          setOpportunity({
            id: raw.id ?? opportunityId,
            name: raw.name ?? '',
            account: raw.customerName ?? raw.account ?? '',
            stage: raw.stage ?? 'prospecting',
            amount: Number(raw.amount ?? 0),
            probability: Number(raw.probability ?? 0),
            expectedCloseDate: (raw.expectedCloseDate ?? '')?.toString().slice(0, 10),
            owner: raw.ownerName ?? '',
            createdAt: (raw.createdAt ?? '')?.toString().slice(0, 10),
            description: raw.description ?? '',
            contactPerson: raw.contactName ?? '',
            contactEmail: raw.contactEmail ?? '',
            contactPhone: raw.contactPhone ?? '',
            nextStep: raw.nextStep ?? '',
            competitorInfo: raw.competitorInfo ?? raw.competitors ?? '',
          })
        }

        const activitiesRaw = await crmService.opportunities
          .getActivities(opportunityId)
          .catch(() => [])
        if (!cancelled) {
          setTimeline(
            asArray(activitiesRaw).map((a: any) => ({
              date: (a.startDate ?? a.createdAt ?? '').toString().slice(0, 10),
              type: a.type ?? a.activityType ?? 'Activity',
              description: a.description ?? a.subject ?? a.title ?? '',
              user: a.performedByName ?? a.assignedToName ?? 'System',
            })),
          )
        }
      } catch {
        // keep empty state on error
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [opportunityId])

  // CRM to Sales connections (relationship data not yet served by API)
  const [salesConnections] = useState<CRMToSalesConnection>({
    opportunityId,
    opportunityName: '',
    quotes: [],
    orders: [],
  })

  const handleCreateQuote = () => {
    addToast({
      title: 'Creating Quote',
      message: 'Navigating to quote creation from opportunity...',
      variant: 'info'
    })
    router.push(`/sales/quotes/create?opportunity=${opportunity.id}`)
  }

  const handleCreateOrder = () => {
    addToast({
      title: 'Creating Order',
      message: 'Converting opportunity to sales order...',
      variant: 'info'
    })
    router.push(`/sales/orders/create?opportunity=${opportunity.id}`)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'bg-blue-100 text-blue-700'
      case 'qualification': return 'bg-purple-100 text-purple-700'
      case 'proposal': return 'bg-yellow-100 text-yellow-700'
      case 'negotiation': return 'bg-orange-100 text-orange-700'
      case 'closed_won': return 'bg-green-100 text-green-700'
      case 'closed_lost': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{opportunity.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{opportunity.account}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/crm/opportunities/edit/${opportunityId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={async () => {
                  try {
                    await crmService.opportunities.delete(opportunityId)
                    addToast({ title: 'Opportunity Deleted', message: 'The opportunity has been removed.', variant: 'success' })
                    router.push('/crm/opportunities')
                  } catch {
                    addToast({ title: 'Delete Failed', message: 'Could not delete the opportunity.', variant: 'error' })
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Amount
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                ₹{(opportunity.amount / 100000).toFixed(2)}L
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
                <Target className="w-3 h-3" />
                Probability
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{opportunity.probability}%</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Stage
              </div>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${getStageColor(opportunity.stage)}`}>
                {opportunity.stage.replace('_', ' ').charAt(0).toUpperCase() + opportunity.stage.slice(1)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="text-sm text-orange-600 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Close Date
              </div>
              <div className="text-lg font-bold text-orange-900 mt-1">{opportunity.expectedCloseDate}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
              <div className="text-sm text-teal-600 font-medium flex items-center gap-1">
                <User className="w-3 h-3" />
                Owner
              </div>
              <div className="text-sm font-semibold text-teal-900 mt-2">{opportunity.owner}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-3 gap-3">
        {/* Left Column - Details */}
        <div className="col-span-2 space-y-3">
          {/* Opportunity Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Opportunity Details</h2>

            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{opportunity.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Account
                  </label>
                  <p className="mt-1 text-gray-900 font-semibold">{opportunity.account}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Person
                  </label>
                  <p className="mt-1 text-gray-900">{opportunity.contactPerson}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <a href={`mailto:${opportunity.contactEmail}`} className="mt-1 text-blue-600 hover:underline block">
                    {opportunity.contactEmail}
                  </a>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <a href={`tel:${opportunity.contactPhone}`} className="mt-1 text-blue-600 hover:underline block">
                    {opportunity.contactPhone}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Next Step
                </label>
                <p className="mt-1 text-gray-900">{opportunity.nextStep}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Competitor Information</label>
                <p className="mt-1 text-gray-900">{opportunity.competitorInfo}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Created on {opportunity.createdAt}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Activity Timeline</h2>
            <div className="space-y-3">
              {timeline.length === 0 && !loading && (
                <p className="text-sm text-gray-500">No activity recorded yet.</p>
              )}
              {timeline.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{activity.type}</span>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Connections */}
        <div className="space-y-3">
          {/* Inter-Module Connections */}
          <CRMToSalesConnections connection={salesConnections} />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleCreateQuote}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Create Quote
              </button>
              <button
                onClick={handleCreateOrder}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Convert to Order
              </button>
              <button
                onClick={() => addToast({ title: 'Schedule Meeting', message: 'Calendar integration will be implemented', variant: 'info' })}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </button>
              <button
                onClick={() => addToast({ title: 'Send Email', message: 'Email composer will open', variant: 'info' })}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>

          {/* Related Files Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-bold text-gray-900 mb-3">Attached Files</h3>
            <div className="space-y-2">
              {[
                { name: 'Proposal_v2.pdf', size: '2.4 MB', date: '2025-10-25' },
                { name: 'Product_Catalog.pdf', size: '5.1 MB', date: '2025-10-20' },
                { name: 'Site_Photos.zip', size: '12.8 MB', date: '2025-10-15' }
              ].map((file, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div className="font-medium text-sm text-gray-900">{file.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{file.size} • {file.date}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Upload File
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
