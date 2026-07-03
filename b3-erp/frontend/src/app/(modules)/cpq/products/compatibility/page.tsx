'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Network,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react'
import { cpqCompatibilityService } from '@/services/cpq/cpq-orphans.service'

interface CompatibilityMatrix {
  product1: string
  product2: string
  compatible: boolean
  reason?: string
  severity?: 'critical' | 'warning' | 'info'
}

export default function CPQProductsCompatibilityPage() {
  const router = useRouter()

  const products = [
    'Premium Cabinets',
    'Modular Kitchen',
    'Island Kitchen',
    'L-Shaped Kitchen',
    'Straight Kitchen',
    'Stone Countertop',
    'Quartz Countertop',
    'Smart Appliances'
  ]

  const [compatibilityData, setCompatibilityData] = useState<CompatibilityMatrix[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true); setError(null)
    cpqCompatibilityService.findAll()
      .then(rows => { if (active) setCompatibilityData((Array.isArray(rows) ? rows : []).map(r => ({ product1: r.product1, product2: r.product2, compatible: Boolean(r.compatible), reason: r.reason ?? undefined, severity: (r.severity ?? undefined) as any }))) })
      .catch(err => { if (active) setError(err?.message || 'Failed to load compatibility data') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const getCompatibilityCount = () => {
    const compatible = compatibilityData.filter(c => c.compatible).length
    const incompatible = compatibilityData.filter(c => !c.compatible).length
    const total = compatibilityData.length
    return { compatible, incompatible, total }
  }

  const getSeverityColor = (severity?: string) => {
    if (!severity) return ''
    const colors: any = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200'
    }
    return colors[severity] || ''
  }

  const getSeverityIcon = (severity?: string) => {
    if (!severity) return null
    if (severity === 'critical') return <XCircle className="h-4 w-4" />
    if (severity === 'warning') return <AlertTriangle className="h-4 w-4" />
    return <Info className="h-4 w-4" />
  }

  const stats = getCompatibilityCount()

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Loading Banner */}
      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading compatibility data...
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
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
            Export Matrix
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Rules</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1">Compatibility checks</p>
            </div>
            <Network className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Compatible</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.compatible}</p>
              <p className="text-xs text-green-700 mt-1">{stats.total > 0 ? Math.round((stats.compatible / stats.total) * 100) : 0}% of rules</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Incompatible</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.incompatible}</p>
              <p className="text-xs text-red-700 mt-1">{stats.total > 0 ? Math.round((stats.incompatible / stats.total) * 100) : 0}% of rules</p>
            </div>
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Products</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{products.length}</p>
              <p className="text-xs text-purple-700 mt-1">In compatibility matrix</p>
            </div>
            <Network className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search product compatibility..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Compatibility Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product 1</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product 2</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Compatible</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason / Notes</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {compatibilityData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.product1}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.product2}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {item.compatible ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Yes</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-700">No</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {item.reason ? (
                      <div className="text-sm text-gray-700">{item.reason}</div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No restrictions</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {item.severity && (
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(item.severity)}`}>
                        {getSeverityIcon(item.severity)}
                        {item.severity}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Compatibility Legend:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Critical</p>
              <p className="text-xs text-gray-600">Products cannot be used together</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Warning</p>
              <p className="text-xs text-gray-600">Compatible with limitations</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Info</p>
              <p className="text-xs text-gray-600">Recommended combinations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
