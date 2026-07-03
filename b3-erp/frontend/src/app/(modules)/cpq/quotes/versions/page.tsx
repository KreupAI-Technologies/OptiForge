'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GitBranch,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  GitCompare,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { ViewVersionModal, CompareVersionsModal, VersionTimelineModal, FilterModal } from '@/components/cpq/QuoteVersionModals'
import { cpqQuoteVersionService } from '@/services/cpq/cpq-orphans.service'

interface QuoteVersion {
  id: string
  quoteNumber: string
  version: string
  customerName: string
  value: number
  changes: string[]
  changeType: 'price-increase' | 'price-decrease' | 'items-added' | 'items-removed' | 'terms-updated'
  createdBy: string
  createdDate: string
  status: 'draft' | 'sent' | 'current' | 'superseded'
}

export default function CPQQuotesVersionsPage() {
  const router = useRouter()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null)
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set())

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Selected items
  const [selectedVersion, setSelectedVersion] = useState<QuoteVersion | null>(null)
  const [compareVersion1, setCompareVersion1] = useState<QuoteVersion | null>(null)
  const [compareVersion2, setCompareVersion2] = useState<QuoteVersion | null>(null)
  const [selectedQuoteForTimeline, setSelectedQuoteForTimeline] = useState<string>('')

  // Advanced filters
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const [versions, setVersions] = useState<QuoteVersion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    cpqQuoteVersionService
      .findAll()
      .then((rows) => {
        if (!active) return
        const mapped: QuoteVersion[] = (Array.isArray(rows) ? rows : []).map((r) => ({
          id: r.id,
          quoteNumber: r.quoteNumber ?? '',
          version: r.version ?? '',
          customerName: r.customerName ?? '',
          value: Number(r.value) || 0,
          changes: Array.isArray(r.changes) ? r.changes : [],
          changeType: (r.changeType ?? 'items-added') as QuoteVersion['changeType'],
          createdBy: r.createdBy ?? '',
          createdDate: r.createdDate ?? '',
          status: (r.status ?? 'draft') as QuoteVersion['status']
        }))
        setVersions(mapped)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Handler functions
  const handleViewVersion = (version: QuoteVersion) => {
    setSelectedVersion(version)
    setIsViewModalOpen(true)
  }

  const handleCompareVersions = (version1: QuoteVersion, version2: QuoteVersion) => {
    setCompareVersion1(version1)
    setCompareVersion2(version2)
    setIsCompareModalOpen(true)
  }

  const handleShowTimeline = (quoteNumber: string) => {
    setSelectedQuoteForTimeline(quoteNumber)
    setIsTimelineModalOpen(true)
  }

  const handleCopyVersion = (version: QuoteVersion) => {
    router.push(`/cpq/quotes/builder?copyFrom=${version.id}`)
  }

  const handleExport = () => {
    const csvContent = [
      ['Quote Number', 'Version', 'Customer', 'Value', 'Change Type', 'Created By', 'Date', 'Status', 'Changes'].join(','),
      ...filteredVersions.map(v => [
        v.quoteNumber,
        v.version,
        `"${v.customerName}"`,
        v.value,
        v.changeType,
        `"${v.createdBy}"`,
        v.createdDate,
        v.status,
        `"${v.changes.join('; ')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote-versions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
    setIsFilterModalOpen(false)
  }

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatusFilter(status)
  }

  const toggleQuoteExpansion = (quoteNumber: string) => {
    const newExpanded = new Set(expandedQuotes)
    if (newExpanded.has(quoteNumber)) {
      newExpanded.delete(quoteNumber)
    } else {
      newExpanded.add(quoteNumber)
    }
    setExpandedQuotes(newExpanded)
  }

  // Filtering logic
  const filteredVersions = versions.filter(version => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      version.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.createdBy.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = selectedStatusFilter === null || version.status === selectedStatusFilter

    // Advanced filters
    let matchesAdvancedFilters = true
    if (appliedFilters) {
      if (appliedFilters.statuses.length > 0 && !appliedFilters.statuses.includes(version.status)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.changeTypes.length > 0 && !appliedFilters.changeTypes.includes(version.changeType)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.dateRange.start && new Date(version.createdDate) < new Date(appliedFilters.dateRange.start)) {
        matchesAdvancedFilters = false
      }
      if (appliedFilters.dateRange.end && new Date(version.createdDate) > new Date(appliedFilters.dateRange.end)) {
        matchesAdvancedFilters = false
      }
    }

    return matchesSearch && matchesStatus && matchesAdvancedFilters
  })

  // Group versions by quote number
  const groupedVersions = filteredVersions.reduce((acc, version) => {
    if (!acc[version.quoteNumber]) {
      acc[version.quoteNumber] = []
    }
    acc[version.quoteNumber].push(version)
    return acc
  }, {} as Record<string, QuoteVersion[]>)

  // Sort versions within each group by creation date (newest first)
  Object.keys(groupedVersions).forEach(quoteNumber => {
    groupedVersions[quoteNumber].sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    )
  })

  const getChangeTypeColor = (type: string) => {
    const colors: any = {
      'price-increase': 'bg-red-100 text-red-700 border-red-200',
      'price-decrease': 'bg-green-100 text-green-700 border-green-200',
      'items-added': 'bg-blue-100 text-blue-700 border-blue-200',
      'items-removed': 'bg-orange-100 text-orange-700 border-orange-200',
      'terms-updated': 'bg-purple-100 text-purple-700 border-purple-200'
    }
    return colors[type] || colors['items-added']
  }

  const getChangeTypeIcon = (type: string) => {
    if (type === 'price-increase') return <TrendingUp className="h-4 w-4" />
    if (type === 'price-decrease') return <TrendingDown className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      current: 'bg-green-100 text-green-700 border-green-200',
      superseded: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[status] || colors.draft
  }

  const totalVersions = filteredVersions.length
  const currentVersions = filteredVersions.filter(v => v.status === 'current').length
  const avgVersionsPerQuote = totalVersions / (Object.keys(groupedVersions).length || 1)

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Versions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalVersions}</p>
              <p className="text-xs text-blue-700 mt-1">All quote revisions</p>
            </div>
            <GitBranch className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Current Versions</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{currentVersions}</p>
              <p className="text-xs text-green-700 mt-1">Active quotes</p>
            </div>
            <FileText className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Revisions</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgVersionsPerQuote.toFixed(1)}</p>
              <p className="text-xs text-purple-700 mt-1">Per quote</p>
            </div>
            <GitBranch className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Unique Quotes</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {Object.keys(groupedVersions).length}
              </p>
              <p className="text-xs text-orange-700 mt-1">With versions</p>
            </div>
            <FileText className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-3 flex gap-3">
        <button
          onClick={() => handleStatusFilter(null)}
          className={`px-4 py-2 ${
            selectedStatusFilter === null
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors`}
        >
          All Versions ({versions.length})
        </button>
        <button
          onClick={() => handleStatusFilter('current')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'current'
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-green-50 text-sm transition-colors`}
        >
          Current ({versions.filter(v => v.status === 'current').length})
        </button>
        <button
          onClick={() => handleStatusFilter('superseded')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'superseded'
              ? 'bg-orange-100 text-orange-700 border-orange-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-orange-50 text-sm transition-colors`}
        >
          Superseded ({versions.filter(v => v.status === 'superseded').length})
        </button>
        <button
          onClick={() => handleStatusFilter('sent')}
          className={`px-4 py-2 ${
            selectedStatusFilter === 'sent'
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-white text-gray-700 border-gray-300'
          } border rounded-lg hover:bg-blue-50 text-sm transition-colors`}
        >
          Sent ({versions.filter(v => v.status === 'sent').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote number, customer, version, or created by..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Grouped Versions Display */}
      <div className="space-y-2">
        {Object.keys(groupedVersions).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <GitBranch className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No versions found matching your filters</p>
          </div>
        ) : (
          Object.entries(groupedVersions).map(([quoteNumber, quoteVersions]) => {
            const isExpanded = expandedQuotes.has(quoteNumber)
            const currentVersion = quoteVersions.find(v => v.status === 'current') || quoteVersions[0]
            const versionCount = quoteVersions.length

            return (
              <div key={quoteNumber} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Quote Header - Always Visible */}
                <div
                  onClick={() => toggleQuoteExpansion(quoteNumber)}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors border-b border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleQuoteExpansion(quoteNumber)
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-blue-900">{quoteNumber}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {versionCount} version{versionCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{currentVersion.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Current Version</p>
                        <p className="text-lg font-bold text-gray-900">{currentVersion.version}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Current Value</p>
                        <p className="text-lg font-bold text-gray-900">₹{(currentVersion.value / 100000).toFixed(2)}L</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShowTimeline(quoteNumber)
                          }}
                          className="px-3 py-1.5 text-xs text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Timeline
                        </button>
                        {versionCount > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompareVersions(quoteVersions[0], quoteVersions[1])
                            }}
                            className="px-3 py-1.5 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <GitCompare className="h-3 w-3" />
                            Compare
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Version Details */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {quoteVersions.map((version, idx) => (
                      <div
                        key={version.id}
                        onClick={() => handleViewVersion(version)}
                        className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {/* Version Badge */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                version.status === 'current' ? 'bg-green-100 border-2 border-green-500' :
                                version.status === 'sent' ? 'bg-blue-100 border-2 border-blue-500' :
                                'bg-gray-100 border-2 border-gray-300'
                              }`}>
                                <span className="text-sm font-bold text-gray-900">{version.version}</span>
                              </div>
                            </div>

                            {/* Version Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(version.status)}`}>
                                  {version.status}
                                </span>
                                <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getChangeTypeColor(version.changeType)}`}>
                                  {getChangeTypeIcon(version.changeType)}
                                  {version.changeType.replace('-', ' ')}
                                </span>
                              </div>
                              <ul className="text-sm text-gray-700 space-y-1 mb-2">
                                {version.changes.map((change, changeIdx) => (
                                  <li key={changeIdx} className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>By {version.createdBy}</span>
                                <span>•</span>
                                <span>
                                  {new Date(version.createdDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Value */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-600 mb-1">Value</p>
                              <p className="text-lg font-bold text-gray-900">
                                ₹{(version.value / 100000).toFixed(2)}L
                              </p>
                              {idx > 0 && (
                                <p className={`text-xs font-medium ${
                                  version.value > quoteVersions[idx - 1].value ? 'text-red-600' :
                                  version.value < quoteVersions[idx - 1].value ? 'text-green-600' :
                                  'text-gray-600'
                                }`}>
                                  {version.value > quoteVersions[idx - 1].value && '↑'}
                                  {version.value < quoteVersions[idx - 1].value && '↓'}
                                  {version.value !== quoteVersions[idx - 1].value &&
                                    ` ₹${Math.abs(version.value - quoteVersions[idx - 1].value) / 100000}L`
                                  }
                                  {version.value === quoteVersions[idx - 1].value && 'No change'}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewVersion(version)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyVersion(version)
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Copy version"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              {idx < quoteVersions.length - 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCompareVersions(version, quoteVersions[idx + 1])
                                  }}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Compare with previous"
                                >
                                  <GitCompare className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Version Control Info */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Version Control Benefits:
        </h3>
        <ul className="text-xs text-purple-700 space-y-1">
          <li><strong>Change Tracking:</strong> Complete audit trail of all quote modifications</li>
          <li><strong>Version Comparison:</strong> Compare different versions to see what changed</li>
          <li><strong>Rollback Capability:</strong> Revert to previous versions if needed</li>
          <li><strong>Approval Workflow:</strong> Track which versions were sent and approved by customers</li>
        </ul>
      </div>

      {/* Modals */}
      <ViewVersionModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedVersion(null)
        }}
        version={selectedVersion}
        onCompare={() => {
          if (selectedVersion) {
            setIsViewModalOpen(false)
            const sameQuoteVersions = versions.filter(v => v.quoteNumber === selectedVersion.quoteNumber)
            if (sameQuoteVersions.length > 1) {
              handleCompareVersions(sameQuoteVersions[0], sameQuoteVersions[1])
            }
          }
        }}
        onCreateNew={() => {
          if (selectedVersion) {
            setIsViewModalOpen(false)
            router.push(`/cpq/quotes/builder?basedOn=${selectedVersion.id}`)
          }
        }}
      />

      <CompareVersionsModal
        isOpen={isCompareModalOpen}
        onClose={() => {
          setIsCompareModalOpen(false)
          setCompareVersion1(null)
          setCompareVersion2(null)
        }}
        version1={compareVersion1}
        version2={compareVersion2}
      />

      <VersionTimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => {
          setIsTimelineModalOpen(false)
          setSelectedQuoteForTimeline('')
        }}
        quoteNumber={selectedQuoteForTimeline}
        versions={versions.filter(v => v.quoteNumber === selectedQuoteForTimeline)}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
