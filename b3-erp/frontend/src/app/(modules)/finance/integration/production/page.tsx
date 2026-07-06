'use client'

import { useState, useEffect } from 'react'
import { FinanceService } from '@/services/finance.service'
import { Factory, TrendingUp, DollarSign, Package, Users, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface ProductionSync {
  id: string
  batchNumber: string
  productName: string
  quantityProduced: number
  productionDate: string
  materialCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  unitCost: number
  syncStatus: 'synced' | 'pending' | 'failed'
  journalEntry: string
  lastSyncTime: string
}

export default function ProductionIntegrationPage() {
  const [syncData, setSyncData] = useState<ProductionSync[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Job cost sheets (finance ↔ production WIP / job costing) mapped into the
  // ProductionSync shape the table reads.
  const mapJobCostSheet = (r: any): ProductionSync => {
    const materialCost = Number(r?.materialCost ?? r?.totalMaterialCost ?? r?.directMaterialCost) || 0
    const laborCost = Number(r?.laborCost ?? r?.totalLaborCost ?? r?.directLaborCost) || 0
    const overheadCost = Number(r?.overheadCost ?? r?.totalOverheadCost ?? r?.manufacturingOverhead) || 0
    const totalCost = Number(r?.totalActualCost ?? r?.totalEstimatedCost ?? (materialCost + laborCost + overheadCost)) || 0
    const qty = Number(r?.quantityProduced ?? r?.quantity ?? r?.completedQuantity) || 0
    const unitCost = qty > 0 ? Math.round(totalCost / qty) : 0

    const rawStatus = String(r?.status ?? '').toLowerCase()
    let syncStatus: ProductionSync['syncStatus'] = 'synced'
    if (rawStatus.includes('fail') || rawStatus.includes('error')) syncStatus = 'failed'
    else if (rawStatus.includes('pending') || rawStatus.includes('open') || rawStatus.includes('draft') || rawStatus.includes('progress')) syncStatus = 'pending'

    return {
      id: String(r?.id ?? r?.jobNumber ?? ''),
      batchNumber: String(r?.jobNumber ?? r?.batchNumber ?? r?.id ?? ''),
      productName: String(r?.customer ?? r?.customerName ?? r?.productName ?? r?.projectName ?? '-'),
      quantityProduced: qty,
      productionDate: r?.startDate ?? r?.productionDate ?? r?.createdAt ?? '',
      materialCost,
      laborCost,
      overheadCost,
      totalCost,
      unitCost,
      syncStatus,
      journalEntry: String(r?.journalEntry ?? r?.journalEntryNumber ?? '-'),
      lastSyncTime: r?.updatedAt ?? r?.lastSyncTime ?? '-',
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await FinanceService.getJobCostSheets()
        if (active) setSyncData((Array.isArray(data) ? data : []).map(mapJobCostSheet))
      } catch (e: any) {
        if (active) {
          setError(e?.message || 'Failed to load job cost sheets')
          setSyncData([])
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Derived integration stats from the loaded job cost sheets.
  const integrationStats = {
    totalBatchesToday: syncData.length,
    syncedBatches: syncData.filter((b) => b.syncStatus === 'synced').length,
    pendingBatches: syncData.filter((b) => b.syncStatus === 'pending').length,
    failedBatches: syncData.filter((b) => b.syncStatus === 'failed').length,
    totalProductionValue: syncData.reduce((s, b) => s + b.totalCost, 0),
    lastSyncTime: new Date().toLocaleString('en-IN'),
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Integration</h1>
            <p className="text-gray-600 mt-1">Finance-Production module synchronization</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700">
            <RefreshCw className="h-5 w-5" />
            Sync Now
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Factory className="h-6 w-6 text-indigo-600" />
              <span className="text-sm text-gray-600">Total Batches</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{integrationStats.totalBatchesToday}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-600">Synced</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{integrationStats.syncedBatches}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-6 w-6 text-yellow-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{integrationStats.pendingBatches}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span className="text-sm text-gray-600">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{integrationStats.failedBatches}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-purple-600" />
              <span className="text-sm text-gray-600">Production Value</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(integrationStats.totalProductionValue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Production Batch Synchronization</h2>
            <p className="text-sm text-gray-600 mt-1">Last sync: {integrationStats.lastSyncTime}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Batch Number</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Material Cost</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Labor Cost</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Overhead</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Total Cost</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Unit Cost</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Journal Entry</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-gray-500">Loading job cost sheets…</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-red-600">{error}</td>
                  </tr>
                )}
                {!loading && !error && syncData.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-gray-500">No production job cost sheets found.</td>
                  </tr>
                )}
                {syncData.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span className="font-mono text-sm text-gray-900">{batch.batchNumber}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">{batch.productName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{batch.quantityProduced.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(batch.materialCost)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(batch.laborCost)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(batch.overheadCost)}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-gray-900">{formatCurrency(batch.totalCost)}</td>
                    <td className="px-3 py-2 text-sm text-blue-600 font-medium">{formatCurrency(batch.unitCost)}</td>
                    <td className="px-3 py-2">
                      <span className="text-sm font-mono text-gray-900">{batch.journalEntry}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${batch.syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
                            batch.syncStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {batch.syncStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm p-3 text-white">
          <h3 className="text-lg font-semibold mb-2">Integration Mapping</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Production Data Flow</h4>
              <ul className="space-y-1 text-sm">
                <li>• Material consumption → Raw material inventory reduction</li>
                <li>• Labor hours → Work-in-progress allocation</li>
                <li>• Overhead costs → Manufacturing overhead allocation</li>
                <li>• Finished goods → Finished goods inventory increase</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Financial Journal Entries</h4>
              <ul className="space-y-1 text-sm">
                <li>• Dr. Work-in-Progress | Cr. Raw Materials</li>
                <li>• Dr. Work-in-Progress | Cr. Wages Payable</li>
                <li>• Dr. Work-in-Progress | Cr. Manufacturing Overhead</li>
                <li>• Dr. Finished Goods | Cr. Work-in-Progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
