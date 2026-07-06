'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, GitCompare, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, DollarSign, Percent } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { estimationBOQService, type BOQ } from '@/services/estimation-boq.service'

interface BOQComparison {
  projectName: string
  versions: BOQVersion[]
}

interface BOQVersion {
  id: string
  versionName: string
  versionNumber: string
  type: 'internal' | 'vendor_a' | 'vendor_b' | 'revised'
  totalCost: number
  materialCost: number
  laborCost: number
  overheadCost: number
  profitMargin: number
  deliveryDays: number
  warranty: string
  items: ComparisonItem[]
  notes: string
  submittedBy: string
  submittedDate: string
}

interface ComparisonItem {
  itemName: string
  unit: string
  quantity: number
  rate: number
  amount: number
}

const EMPTY_COMPARISON: BOQComparison = { projectName: '', versions: [] }

export default function BOQComparisonPage() {
  const router = useRouter()

  const [boqList, setBoqList] = useState<BOQ[]>([])
  const [boqId1, setBoqId1] = useState('')
  const [boqId2, setBoqId2] = useState('')
  const [isComparing, setIsComparing] = useState(false)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [selectedData, setSelectedData] = useState<BOQComparison>(EMPTY_COMPARISON)

  // Load available BOQs for the selectors
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await estimationBOQService.findAll()
        if (!cancelled) setBoqList(Array.isArray(res) ? res : [])
      } catch (err) {
        if (!cancelled) setBoqList([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleCompare = async () => {
    if (!boqId1 || !boqId2 || boqId1 === boqId2) {
      setCompareError('Please select two different BOQs to compare')
      return
    }
    setIsComparing(true)
    setCompareError(null)
    try {
      const result = (await estimationBOQService.compareBOQs(boqId1, boqId2)) as any
      const b1 = result?.boq1
      const b2 = result?.boq2
      const mapVersion = (b: any, idx: number, type: BOQVersion['type']): BOQVersion => ({
        id: b?.id ?? `v${idx}`,
        versionName: b?.projectName ?? b?.boqNumber ?? `BOQ ${idx + 1}`,
        versionNumber: b?.boqNumber ?? `V${idx + 1}`,
        type,
        totalCost: Number(b?.estimatedValue ?? 0),
        materialCost: 0,
        laborCost: 0,
        overheadCost: 0,
        profitMargin: 0,
        deliveryDays: 0,
        warranty: '-',
        submittedBy: b?.clientName ?? '-',
        submittedDate: b?.updatedAt ?? b?.createdAt ?? new Date().toISOString(),
        notes: b?.notes ?? '',
        items: [],
      })
      const versions: BOQVersion[] = []
      if (b1) versions.push(mapVersion(b1, 0, 'internal'))
      if (b2) versions.push(mapVersion(b2, 1, 'vendor_a'))
      setSelectedData({
        projectName: b1?.projectName ?? b2?.projectName ?? 'BOQ Comparison',
        versions,
      })
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : 'Failed to compare BOQs')
      setSelectedData(EMPTY_COMPARISON)
    } finally {
      setIsComparing(false)
    }
  }

  const hasData = Array.isArray(selectedData.versions) && selectedData.versions.length > 0

  const getLowestCost = () => {
    if (!selectedData.versions.length) return 0
    return Math.min(...selectedData.versions.map(v => v.totalCost))
  }

  const getHighestCost = () => {
    if (!selectedData.versions.length) return 0
    return Math.max(...selectedData.versions.map(v => v.totalCost))
  }

  const getCostDifference = (cost: number) => {
    const lowest = getLowestCost()
    if (!lowest) return 0
    return ((cost - lowest) / lowest) * 100
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'vendor_a':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'vendor_b':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'revised':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const EMPTY_VERSION: BOQVersion = {
    id: '', versionName: '-', versionNumber: '-', type: 'internal', totalCost: 0,
    materialCost: 0, laborCost: 0, overheadCost: 0, profitMargin: 0, deliveryDays: 0,
    warranty: '-', submittedBy: '-', submittedDate: new Date().toISOString(), notes: '', items: [],
  }

  const lowestCostVersion = selectedData.versions.length
    ? selectedData.versions.reduce((prev, current) => (prev.totalCost < current.totalCost ? prev : current))
    : EMPTY_VERSION

  const bestValueVersion = selectedData.versions.length
    ? selectedData.versions.reduce((prev, current) => {
        const prevScore = (100 - getCostDifference(prev.totalCost)) + (prev.profitMargin * 2) + (prev.deliveryDays < 45 ? 10 : 0)
        const currentScore = (100 - getCostDifference(current.totalCost)) + (current.profitMargin * 2) + (current.deliveryDays < 45 ? 10 : 0)
        return currentScore > prevScore ? current : prev
      })
    : EMPTY_VERSION

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BOQ Comparison</h1>
            <p className="text-sm text-gray-600 mt-1">Compare different BOQ versions and vendor quotes</p>
          </div>
        </div>
      </div>

      {/* BOQ Selectors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First BOQ</label>
            <select
              value={boqId1}
              onChange={(e) => setBoqId1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a BOQ</option>
              {(Array.isArray(boqList) ? boqList : []).map((b) => (
                <option key={b.id} value={b.id}>{b.boqNumber} - {b.projectName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Second BOQ</label>
            <select
              value={boqId2}
              onChange={(e) => setBoqId2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a BOQ</option>
              {(Array.isArray(boqList) ? boqList : []).map((b) => (
                <option key={b.id} value={b.id}>{b.boqNumber} - {b.projectName}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCompare}
            disabled={isComparing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <GitCompare className="h-5 w-5" />
            {isComparing ? 'Comparing...' : 'Compare'}
          </button>
        </div>
        {compareError && <p className="mt-2 text-sm text-red-600">{compareError}</p>}
      </div>

      {!hasData && !isComparing && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <GitCompare className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
          <p className="text-gray-600">Select two BOQs above and click Compare to see the analysis</p>
        </div>
      )}

      {hasData && (<>
      {/* Project Name */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white mb-3 shadow-lg">
        <div className="flex items-center gap-3">
          <GitCompare className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">{selectedData.projectName}</h2>
            <p className="text-sm text-blue-100 mt-1">Comparing {selectedData.versions.length} versions</p>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-green-900">Lowest Cost</h3>
          </div>
          <p className="text-2xl font-bold text-green-900 mb-1">₹{(getLowestCost() / 100000).toFixed(2)}L</p>
          <p className="text-sm text-green-700">{lowestCostVersion.versionName}</p>
          <p className="text-xs text-green-600 mt-1">{lowestCostVersion.submittedBy}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Best Value</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mb-1">₹{(bestValueVersion.totalCost / 100000).toFixed(2)}L</p>
          <p className="text-sm text-blue-700">{bestValueVersion.versionName}</p>
          <p className="text-xs text-blue-600 mt-1">Optimal price-quality balance</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-5 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <Percent className="h-6 w-6 text-orange-600" />
            <h3 className="font-semibold text-orange-900">Cost Range</h3>
          </div>
          <p className="text-2xl font-bold text-orange-900 mb-1">{(((getHighestCost() - getLowestCost()) / getLowestCost()) * 100).toFixed(1)}%</p>
          <p className="text-sm text-orange-700">Price Variation</p>
          <p className="text-xs text-orange-600 mt-1">₹{((getHighestCost() - getLowestCost()) / 1000).toFixed(0)}K difference</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Parameter</th>
                {selectedData.versions.map((version) => (
                  <th key={version.id} className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    <div>
                      <p>{version.versionName}</p>
                      <p className="text-xs font-normal text-gray-600 mt-1">{version.versionNumber}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Type */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Type</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(version.type)}`}>
                      {version.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Total Cost */}
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-3 px-4 font-bold text-gray-900">Total Cost</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <p className={`font-bold ${version.totalCost === getLowestCost() ? 'text-green-600' : 'text-gray-900'}`}>
                      ₹{(version.totalCost / 100000).toFixed(2)}L
                    </p>
                    {version.totalCost !== getLowestCost() && (
                      <p className="text-xs text-red-600 mt-1">
                        +{getCostDifference(version.totalCost).toFixed(1)}%
                      </p>
                    )}
                  </td>
                ))}
              </tr>

              {/* Material Cost */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Material Cost</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <p className="text-gray-900">₹{(version.materialCost / 100000).toFixed(2)}L</p>
                    <p className="text-xs text-gray-600">{((version.materialCost / version.totalCost) * 100).toFixed(0)}%</p>
                  </td>
                ))}
              </tr>

              {/* Labor Cost */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Labor Cost</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <p className="text-gray-900">₹{(version.laborCost / 100000).toFixed(2)}L</p>
                    <p className="text-xs text-gray-600">{((version.laborCost / version.totalCost) * 100).toFixed(0)}%</p>
                  </td>
                ))}
              </tr>

              {/* Overhead */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Overhead</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center text-gray-900">
                    ₹{(version.overheadCost / 1000).toFixed(0)}K
                  </td>
                ))}
              </tr>

              {/* Profit Margin */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Profit Margin</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <p className="font-semibold text-green-600">{version.profitMargin}%</p>
                  </td>
                ))}
              </tr>

              {/* Delivery Days */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Delivery Timeline</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <p className="text-gray-900">{version.deliveryDays} days</p>
                  </td>
                ))}
              </tr>

              {/* Warranty */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Warranty</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center text-gray-900">
                    {version.warranty}
                  </td>
                ))}
              </tr>

              {/* Submitted By */}
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-700">Submitted By</td>
                {selectedData.versions.map((version) => (
                  <td key={version.id} className="py-3 px-4 text-center">
                    <p className="text-sm text-gray-900">{version.submittedBy}</p>
                    <p className="text-xs text-gray-600">{new Date(version.submittedDate).toLocaleDateString('en-IN')}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Item-wise Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Item-wise Rate Comparison</h2>
        <div className="space-y-2">
          {selectedData.versions[0].items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-gray-900 mb-3">{item.itemName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {selectedData.versions.map((version) => {
                  const versionItem = version.items[index]
                  const rates = selectedData.versions.map(v => v.items[index].rate)
                  const minRate = Math.min(...rates)
                  const isLowest = versionItem.rate === minRate

                  return (
                    <div key={version.id} className={`p-3 rounded-lg border ${isLowest ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <p className="text-xs text-gray-600 mb-1">{version.versionName}</p>
                      <p className={`font-bold ${isLowest ? 'text-green-600' : 'text-gray-900'}`}>
                        ₹{versionItem.rate.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {versionItem.quantity} {versionItem.unit}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="font-bold text-green-900">Recommended Choice</h3>
          </div>
          <p className="text-lg font-semibold text-green-900 mb-2">{bestValueVersion.versionName}</p>
          <p className="text-sm text-green-700 mb-2">{bestValueVersion.notes}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Cost:</span>
              <span className="font-semibold text-green-900">₹{(bestValueVersion.totalCost / 100000).toFixed(2)}L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Delivery:</span>
              <span className="font-semibold text-green-900">{bestValueVersion.deliveryDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Warranty:</span>
              <span className="font-semibold text-green-900">{bestValueVersion.warranty}</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="font-bold text-orange-900">Key Considerations</h3>
          </div>
          <ul className="space-y-2 text-sm text-orange-800">
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>Price difference between lowest and highest: ₹{((getHighestCost() - getLowestCost()) / 1000).toFixed(0)}K</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>Delivery timeline varies from {Math.min(...selectedData.versions.map(v => v.deliveryDays))} to {Math.max(...selectedData.versions.map(v => v.deliveryDays))} days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>Consider warranty periods when making final decision</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>Review vendor reputation and past project experience</span>
            </li>
          </ul>
        </div>
      </div>
      </>)}
    </div>
  )
}
