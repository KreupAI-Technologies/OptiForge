'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Lock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Copy
} from 'lucide-react'
import { cpqContractService } from '@/services/cpq'

interface Clause {
  id: string
  name: string
  category: 'essential' | 'legal' | 'operational' | 'financial' | 'compliance'
  description: string
  fullText: string
  isRequired: boolean
  usageCount: number
  lastUsed: string
  status: 'active' | 'review' | 'deprecated'
  version: string
  approvedBy: string
  approvalDate: string
  applicableContractTypes: string[]
}

export default function CPQContractsClausesPage() {
  const router = useRouter()

  const [clauses, setClauses] = useState<Clause[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the ContractClause ORM shape (title/content/category/
        // clauseType/language/usageCount/isActive); map it to this page's richer
        // Clause model. Fields not tracked on the clause record (fullText excerpt,
        // isRequired, version, approvedBy, contract types) fall back to defaults.
        const raw = (await cpqContractService.findAllClauses()) as any[]
        const categoryMap: Record<string, Clause['category']> = {
          warranty: 'operational',
          liability: 'legal',
          legal: 'legal',
          financial: 'financial',
          payment: 'financial',
          compliance: 'compliance',
          essential: 'essential',
          operational: 'operational',
        }
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : ''
        const mapped: Clause[] = (raw ?? []).map((c) => ({
          id: c.id ?? '',
          name: c.title ?? '',
          category: categoryMap[String(c.category ?? '').toLowerCase()] ?? 'essential',
          description: typeof c.content === 'string' ? c.content.slice(0, 160) : '',
          fullText: c.content ?? '',
          isRequired: c.clauseType === 'standard',
          usageCount: Number(c.usageCount ?? 0),
          lastUsed: toDate(c.updatedAt),
          status: c.isActive === false ? 'deprecated' : 'active',
          version: c.version ?? '1.0',
          approvedBy: c.approvedBy ?? '',
          approvalDate: toDate(c.createdAt),
          applicableContractTypes: Array.isArray(c.applicableContractTypes)
            ? c.applicableContractTypes
            : [],
        }))
        if (!cancelled) setClauses(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load clauses')
          setClauses([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: any = {
      essential: 'bg-red-100 text-red-700 border-red-200',
      legal: 'bg-purple-100 text-purple-700 border-purple-200',
      operational: 'bg-blue-100 text-blue-700 border-blue-200',
      financial: 'bg-green-100 text-green-700 border-green-200',
      compliance: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[category] || colors.essential
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-700 border-green-200',
      review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      deprecated: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.active
  }

  const totalClauses = clauses.length
  const requiredClauses = clauses.filter(c => c.isRequired).length
  const activeClauses = clauses.filter(c => c.status === 'active').length
  const totalUsage = clauses.reduce((sum, c) => sum + c.usageCount, 0)

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading clauses…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && clauses.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No clauses found.
        </div>
      )}
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Clause
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Clauses</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalClauses}</p>
              <p className="text-xs text-blue-700 mt-1">Available</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Required</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{requiredClauses}</p>
              <p className="text-xs text-red-700 mt-1">Mandatory</p>
            </div>
            <Lock className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeClauses}</p>
              <p className="text-xs text-green-700 mt-1">In use</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Usage</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalUsage}</p>
              <p className="text-xs text-purple-700 mt-1">Contracts</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium whitespace-nowrap">
          All Clauses ({totalClauses})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Essential ({clauses.filter(c => c.category === 'essential').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Legal ({clauses.filter(c => c.category === 'legal').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Operational ({clauses.filter(c => c.category === 'operational').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Financial ({clauses.filter(c => c.category === 'financial').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Compliance ({clauses.filter(c => c.category === 'compliance').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Required Only ({requiredClauses})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clauses by name, category, or contract type..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clauses List */}
      <div className="space-y-3">
        {clauses.map((clause) => (
          <div
            key={clause.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{clause.name}</h3>
                  {clause.isRequired && (
                    <Lock className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{clause.id} • Version {clause.version}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getCategoryColor(clause.category)}`}>
                  {clause.category}
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(clause.status)}`}>
                  {clause.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{clause.description}</p>

            {/* Full Text */}
            <div className="bg-gray-50 rounded p-3 mb-3">
              <p className="text-xs text-gray-700 leading-relaxed">{clause.fullText}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
              <div>
                <p className="text-gray-500">Usage Count</p>
                <p className="font-semibold text-gray-900">{clause.usageCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Used</p>
                <p className="font-semibold text-gray-900">
                  {new Date(clause.lastUsed).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Approved By</p>
                <p className="font-semibold text-gray-900">{clause.approvedBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Approval Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(clause.approvalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Applicable Contract Types */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Applicable to:</p>
              <div className="flex gap-2 flex-wrap">
                {clause.applicableContractTypes.map((type) => (
                  <span key={type} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Add to Contract
              </button>
              <button className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Preview
              </button>
              <button className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Edit
              </button>
              <button className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
                <Copy className="h-3 w-3" />
                Duplicate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clause Info */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Legal Clause Management:</h3>
        <ul className="text-xs text-purple-700 space-y-1">
          <li><strong>Pre-approved:</strong> All clauses reviewed and approved by legal team</li>
          <li><strong>Version Control:</strong> Track clause changes with version history</li>
          <li><strong>Required Clauses:</strong> Red lock icon indicates mandatory inclusion</li>
          <li><strong>Compliance:</strong> Ensures contracts meet legal and regulatory standards</li>
          <li><strong>Reusability:</strong> Use proven clauses across multiple contracts</li>
        </ul>
      </div>
    </div>
  )
}
