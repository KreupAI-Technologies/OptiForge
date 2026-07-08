'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  estimationResourceRateService,
  type ResourceRate,
  type ResourceRateHistoryEntry,
} from '@/services/estimation-resource-rate.service'
import { ArrowLeft, History, Edit2, AlertCircle, Clock } from 'lucide-react'

const COMPANY_ID = 'company-001'

export default function LaborRateHistoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [rate, setRate] = useState<ResourceRate | null>(null)
  const [history, setHistory] = useState<ResourceRateHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      setNotFound(false)
      try {
        const detail = await estimationResourceRateService.findResourceRateById(COMPANY_ID, params.id)
        if (cancelled) return
        if (!detail) {
          setNotFound(true)
          return
        }
        setRate(detail)
        try {
          const rows = await estimationResourceRateService.getResourceRateHistory(COMPANY_ID, params.id)
          if (!cancelled) setHistory(rows)
        } catch {
          if (!cancelled) setHistory([])
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load labor rate')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [params.id])

  const fmtCurrency = (v?: number) =>
    v == null ? '—' : `₹${Number(v).toLocaleString('en-IN')}`

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <History className="h-6 w-6 text-blue-600" />
              Labor Rate History
            </h1>
            <p className="text-sm text-gray-600 mt-1">Rate-change history for this labor rate</p>
          </div>
        </div>
        {rate && (
          <button
            onClick={() => router.push('/estimation/rates/labor')}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Manage Rates
          </button>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading labor rate history…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {notFound && !isLoading && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Labor rate not found.
        </div>
      )}

      {rate && !isLoading && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Rate</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Code</p>
                <p className="text-sm font-medium text-gray-900">{rate.code || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="text-sm font-medium text-gray-900">{rate.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Department</p>
                <p className="text-sm font-medium text-gray-900">{rate.category || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Skill Level</p>
                <p className="text-sm font-medium text-gray-900">{rate.subCategory || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Standard Rate</p>
                <p className="text-sm font-bold text-gray-900">{fmtCurrency(rate.standardRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Overtime Rate</p>
                <p className="text-sm font-medium text-orange-600">{fmtCurrency(rate.overtimeRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Effective From</p>
                <p className="text-sm font-medium text-gray-900">{rate.effectiveFrom || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <p className="text-sm font-medium text-gray-900">{rate.isActive === false ? 'Inactive' : 'Active'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Change History</h2>
            </div>
            {history.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                No rate-change history recorded for this labor rate.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Changed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.map((h, i) => (
                      <tr key={h.id ?? i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {h.effectiveFrom || h.createdAt || '—'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{h.field ?? h.changeType ?? '—'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {String(h.previousValue ?? h.previousRate ?? '—')}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {String(h.newValue ?? h.newRate ?? '—')}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">{h.reason ?? '—'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{h.changedByName ?? h.changedBy ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
