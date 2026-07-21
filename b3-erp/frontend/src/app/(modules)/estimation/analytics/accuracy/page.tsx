'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Target,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react'
import { ClickableTableRow } from '@/components/reports/ClickableTableRow'
import { estimationAnalyticsService, AccuracyAnalysis } from '@/services/estimation-analytics.service'

const companyId = 'default-company-id'

export default function EstimationAnalyticsAccuracyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<AccuracyAnalysis | null>(null)

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const toDate = now.toISOString().split('T')[0]
      const from = new Date(now)
      from.setFullYear(from.getFullYear() - 1)
      const fromDate = from.toISOString().split('T')[0]
      const data = await estimationAnalyticsService.getAccuracyAnalysis(companyId, fromDate, toDate)
      setAnalysis(data ?? null)
    } catch (e) {
      console.error('Failed to load accuracy analysis', e)
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const byCategory = Array.isArray(analysis?.byCategory) ? analysis!.byCategory : []
  const byEstimator = Array.isArray(analysis?.byEstimator) ? analysis!.byEstimator : []

  const handleExport = () => {
    const headers = ['Estimator', 'Estimates', 'Avg Accuracy %']
    const rows = byEstimator.map((e) => [
      e.estimatorName,
      e.count ?? 0,
      (e.averageAccuracy ?? 0).toFixed(1),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `accuracy-analysis-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accurate':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'over-estimated':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'under-estimated':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 5) return 'text-green-600'
    if (variance > 0) return 'text-red-600'
    return 'text-blue-600'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accurate':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'over-estimated':
        return <TrendingDown className="h-5 w-5 text-blue-600" />
      case 'under-estimated':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <XCircle className="h-5 w-5 text-gray-600" />
    }
  }

  // Aggregate-level metrics from the accuracy analysis.
  const totalProjects = byEstimator.reduce((sum, e) => sum + (e.count ?? 0), 0)
  const accuracyRate = (analysis?.averageAccuracy ?? 0).toFixed(1)
  const avgVariance = (analysis?.averageTotalVariance ?? 0).toFixed(1)
  const materialVariance = (analysis?.averageMaterialVariance ?? 0).toFixed(1)
  const laborVariance = (analysis?.averageLaborVariance ?? 0).toFixed(1)
  const overheadVariance = (analysis?.averageOverheadVariance ?? 0).toFixed(1)

  if (loading) {
    return (
      <div className="w-full h-full px-4 py-2 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading accuracy analysis...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalysis}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={loadAnalysis}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Date Range
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Completed Projects</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalProjects}</p>
              <p className="text-xs text-blue-700 mt-1">Analyzed</p>
            </div>
            <Target className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{accuracyRate}%</p>
              <p className="text-xs text-green-700 mt-1">Overall</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Material Variance</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{materialVariance}%</p>
              <p className="text-xs text-red-700 mt-1">Average</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Labor Variance</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{laborVariance}%</p>
              <p className="text-xs text-blue-700 mt-1">Average</p>
            </div>
            <TrendingDown className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Variance</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgVariance}%</p>
              <p className="text-xs text-purple-700 mt-1">Absolute deviation</p>
            </div>
            <Percent className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Variance Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Variance Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Material Variance</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{materialVariance}%</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: `${Math.min(Math.abs(analysis?.averageMaterialVariance ?? 0) * 5, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-red-700 mt-2">Average material cost deviation</p>
          </div>

          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Labor Variance</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{laborVariance}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(Math.abs(analysis?.averageLaborVariance ?? 0) * 5, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-700 mt-2">Average labor cost deviation</p>
          </div>

          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Overhead Variance</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{overheadVariance}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(Math.abs(analysis?.averageOverheadVariance ?? 0) * 5, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-purple-700 mt-2">Average overhead cost deviation</p>
          </div>
        </div>
      </div>

      {/* Accuracy by Estimator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Accuracy by Estimator</h2>
          <p className="text-sm text-gray-600 mt-1">Average estimation accuracy per estimator</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimator
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimates
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Accuracy
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {byEstimator.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    No estimator accuracy data available
                  </td>
                </tr>
              )}
              {byEstimator.map((e) => (
                <ClickableTableRow
                  key={e.estimatorName}
                  onClick={() => router.push(`/estimation?estimator=${encodeURIComponent(e.estimatorName)}`)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{e.estimatorName}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-900">{e.count ?? 0}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-bold ${(e.averageAccuracy ?? 0) >= 90 ? 'text-green-600' : (e.averageAccuracy ?? 0) >= 80 ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {(e.averageAccuracy ?? 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {(e.averageAccuracy ?? 0) >= 90 ? getStatusIcon('accurate') : getStatusIcon('under-estimated')}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${(e.averageAccuracy ?? 0) >= 90 ? getStatusColor('accurate') : getStatusColor('under-estimated')}`}>
                        {(e.averageAccuracy ?? 0) >= 90 ? 'Accurate' : 'Review'}
                      </span>
                    </div>
                  </td>
                </ClickableTableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accuracy by Category */}
      {byCategory.length > 0 && (
        <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Variance by Category</h2>
            <p className="text-sm text-gray-600 mt-1">Average variance per category</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Variance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byCategory.map((c) => (
                  <tr key={c.category} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{c.category}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900">{c.count ?? 0}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${getVarianceColor(c.averageVariance ?? 0)}`}>
                        {(c.averageVariance ?? 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
