'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface Asset {
  id: string
  assetTag: string
  name: string
  type: string
  assignedTo: string
  status: string
  purchaseDate: string
  value: string
}

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getHardwareAssets()
        const mapped: Asset[] = raw.map((r: any) => ({
          id: String(r.id ?? r.assetId ?? ''),
          assetTag: r.assetTag ?? r.tag ?? '',
          name: r.name ?? r.assetName ?? '',
          type: r.type ?? r.assetType ?? 'Hardware',
          assignedTo: r.assignedTo ?? r.assignee ?? '',
          status: r.status ?? '',
          purchaseDate: r.purchaseDate ?? '',
          value: r.value ?? '',
        }))
        if (!cancelled) setAssets(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setAssets([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-3xl font-bold">Asset Management</h1>
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading assets…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && assets.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No assets found.
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset Tag</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-3 py-2"><code className="text-sm">{asset.assetTag}</code></td>
                <td className="px-3 py-2 font-medium">{asset.name}</td>
                <td className="px-3 py-2">{asset.type}</td>
                <td className="px-3 py-2">{asset.assignedTo}</td>
                <td className="px-3 py-2"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{asset.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
