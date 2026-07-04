'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { costEstimateService } from '@/services/estimation-cost-estimate.service'
import {
  FileText,
  Edit2,
  Trash2,
  Send,
  Copy,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  DollarSign
} from 'lucide-react'

interface DraftEstimate {
  id: string
  estimateNumber: string
  projectName: string
  customerName: string
  contactPerson: string
  category: string
  estimatedValue: number
  items: number
  createdBy: string
  createdDate: string
  lastModified: string
  completionPercent: number
  notes: string
}

export default function EstimateWorkflowDraftsPage() {
  const router = useRouter()

  const handleNewDraft = () => {
    router.push('/estimation/workflow/drafts/create')
  }

  const handleEditDraft = (draftId: string) => {
    router.push(`/estimation/workflow/drafts/edit/${draftId}`)
  }

  const handleCopyDraft = (draftId: string) => {
    console.log('Copying draft:', draftId)
    // Would create a copy of the draft
    router.push(`/estimation/workflow/drafts/create?copy=${draftId}`)
  }

  const handleDeleteDraft = async (draftId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete draft "${projectName}"? This action cannot be undone.`)) {
      return
    }
    try {
      await costEstimateService.delete('default', draftId)
      setDrafts(prev => prev.filter(d => d.id !== draftId))
    } catch (err) {
      alert('Failed to delete draft. Please try again.')
    }
  }

  const handleSendDraft = (draftId: string) => {
    router.push(`/estimation/workflow/send/${draftId}`)
  }

  const [drafts, setDrafts] = useState<DraftEstimate[]>([
    {
      id: 'DRAFT-001',
      estimateNumber: 'EST-2025-0145',
      projectName: 'Luxury Villa - Complete Kitchen Setup',
      customerName: 'Prestige Constructions Pvt Ltd',
      contactPerson: 'Mr. Rajesh Kumar',
      category: 'Modular Kitchen',
      estimatedValue: 3850000,
      items: 45,
      createdBy: 'Amit Sharma',
      createdDate: '2025-10-18',
      lastModified: '2025-10-20 14:30',
      completionPercent: 75,
      notes: 'Pending cabinet hardware selection and countertop finalization'
    },
    {
      id: 'DRAFT-002',
      estimateNumber: 'EST-2025-0148',
      projectName: 'Restaurant Kitchen - Commercial Setup',
      customerName: 'Foodie Hub Restaurants',
      contactPerson: 'Ms. Priya Desai',
      category: 'Commercial Kitchen',
      estimatedValue: 8500000,
      items: 62,
      createdBy: 'Neha Patel',
      createdDate: '2025-10-19',
      lastModified: '2025-10-20 11:15',
      completionPercent: 60,
      notes: 'Waiting for industrial chimney specifications from client'
    },
    {
      id: 'DRAFT-003',
      estimateNumber: 'EST-2025-0149',
      projectName: '3BHK Apartment - Kitchen Renovation',
      customerName: 'Mr. Suresh Menon',
      contactPerson: 'Mr. Suresh Menon',
      category: 'Kitchen Renovation',
      estimatedValue: 1250000,
      items: 28,
      createdBy: 'Vikram Singh',
      createdDate: '2025-10-19',
      lastModified: '2025-10-20 09:45',
      completionPercent: 85,
      notes: 'Almost complete, pending final pricing approval from management'
    },
    {
      id: 'DRAFT-004',
      estimateNumber: 'EST-2025-0151',
      projectName: 'Builder Package - 50 Units Standard Kitchen',
      customerName: 'Rainbow Builders & Developers',
      contactPerson: 'Mr. Anil Verma',
      category: 'Builder Package',
      estimatedValue: 12500000,
      items: 18,
      createdBy: 'Ravi Kumar',
      createdDate: '2025-10-20',
      lastModified: '2025-10-20 10:20',
      completionPercent: 40,
      notes: 'Initial draft - working on bulk discount calculation'
    },
    {
      id: 'DRAFT-005',
      estimateNumber: 'EST-2025-0152',
      projectName: 'Premium Island Kitchen with Breakfast Counter',
      customerName: 'Mrs. Anjali Kapoor',
      contactPerson: 'Mrs. Anjali Kapoor',
      category: 'Island Kitchen',
      estimatedValue: 4250000,
      items: 52,
      createdBy: 'Amit Sharma',
      createdDate: '2025-10-20',
      lastModified: '2025-10-20 15:00',
      completionPercent: 55,
      notes: 'Client requested premium quartz countertop options'
    },
    {
      id: 'DRAFT-006',
      estimateNumber: 'EST-2025-0146',
      projectName: 'L-Shaped Kitchen - Contemporary Design',
      customerName: 'Mr. Deepak Shah',
      contactPerson: 'Mr. Deepak Shah',
      category: 'L-Shaped Kitchen',
      estimatedValue: 2850000,
      items: 38,
      createdBy: 'Neha Patel',
      createdDate: '2025-10-18',
      lastModified: '2025-10-19 16:30',
      completionPercent: 70,
      notes: 'Waiting for site measurements verification'
    },
    {
      id: 'DRAFT-007',
      estimateNumber: 'EST-2025-0150',
      projectName: 'Compact Kitchen for 2BHK',
      customerName: 'Ms. Kavita Reddy',
      contactPerson: 'Ms. Kavita Reddy',
      category: 'Compact Kitchen',
      estimatedValue: 850000,
      items: 22,
      createdBy: 'Vikram Singh',
      createdDate: '2025-10-19',
      lastModified: '2025-10-20 08:15',
      completionPercent: 90,
      notes: 'Ready for review, minor adjustments needed in accessories'
    },
    {
      id: 'DRAFT-008',
      estimateNumber: 'EST-2025-0153',
      projectName: 'Hotel Kitchen - 5 Star Property',
      customerName: 'Grand Hyatt Hotels India',
      contactPerson: 'Mr. Karthik Iyer',
      category: 'Institutional Kitchen',
      estimatedValue: 18500000,
      items: 85,
      createdBy: 'Ravi Kumar',
      createdDate: '2025-10-20',
      lastModified: '2025-10-20 12:45',
      completionPercent: 35,
      notes: 'Large project - initial draft stage, multiple revisions expected'
    },
    {
      id: 'DRAFT-009',
      estimateNumber: 'EST-2025-0147',
      projectName: 'Parallel Kitchen with Utility Area',
      customerName: 'Dr. Ramesh Sharma',
      contactPerson: 'Dr. Ramesh Sharma',
      category: 'Parallel Kitchen',
      estimatedValue: 1950000,
      items: 32,
      createdBy: 'Amit Sharma',
      createdDate: '2025-10-18',
      lastModified: '2025-10-20 13:20',
      completionPercent: 80,
      notes: 'Awaiting client feedback on appliance selection'
    }
  ])

  const getCompletionColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-blue-500'
    if (percent >= 30) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getCompletionTextColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600'
    if (percent >= 50) return 'text-blue-600'
    if (percent >= 30) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const totalDrafts = drafts.length
  const avgCompletion = drafts.reduce((sum, d) => sum + d.completionPercent, 0) / totalDrafts
  const totalValue = drafts.reduce((sum, d) => sum + d.estimatedValue, 0)
  const nearComplete = drafts.filter(d => d.completionPercent >= 80).length

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewDraft}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Draft
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Drafts</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalDrafts}</p>
              <p className="text-xs text-blue-700 mt-1">In progress</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Value</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{(totalValue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-green-700 mt-1">Estimated pipeline</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Completion</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgCompletion.toFixed(0)}%</p>
              <p className="text-xs text-purple-700 mt-1">Overall progress</p>
            </div>
            <div className="h-10 w-10 rounded-full border-4 border-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-600">{avgCompletion.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Near Complete</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{nearComplete}</p>
              <p className="text-xs text-orange-700 mt-1">≥80% complete</p>
            </div>
            <Send className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Drafts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {draft.estimateNumber}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCompletionTextColor(draft.completionPercent)} bg-opacity-10`}>
                      {draft.completionPercent}% Complete
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{draft.projectName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{draft.category}</p>
                </div>
              </div>

              <div className="space-y-3 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">{draft.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-semibold">₹{(draft.estimatedValue / 100000).toFixed(2)}L</span>
                  <span className="text-gray-600">• {draft.items} items</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Created: {draft.createdDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Edit2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Modified: {draft.lastModified}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Completion Progress</span>
                  <span className="font-semibold">{draft.completionPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getCompletionColor(draft.completionPercent)}`}
                    style={{ width: `${draft.completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Notes: </span>
                  {draft.notes}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <User className="h-3 w-3" />
                <span>Created by {draft.createdBy}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditDraft(draft.id)}
                  className="flex-1 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  Continue Editing
                </button>
                <button
                  onClick={() => handleCopyDraft(draft.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Copy</span>
                </button>
                <button
                  onClick={() => handleDeleteDraft(draft.id, draft.projectName)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Delete</span>
                </button>
                {draft.completionPercent >= 80 && (
                  <button
                    onClick={() => handleSendDraft(draft.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-100 text-sm"
                  >
                    <Send className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Send</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
