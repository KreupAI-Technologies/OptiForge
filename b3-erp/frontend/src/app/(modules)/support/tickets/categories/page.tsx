'use client'

import { useState, useEffect } from 'react'
import { Tag, Plus, AlertCircle } from 'lucide-react'
import { TicketCategoryService, SupportTicketCategory } from '@/services/support.service'

interface CategoryView {
  id: string
  name: string
  description: string
  color: string
  ticketCount: number
  avgResolutionTime: string
  slaTarget: string
}

export default function TicketCategories() {
  const [categories, setCategories] = useState<CategoryView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = (await TicketCategoryService.getCategories()) as SupportTicketCategory[]
        const mapped: CategoryView[] = (Array.isArray(raw) ? raw : []).map((c) => ({
          id: c.id,
          name: c.name ?? '',
          description: c.description ?? '',
          color: c.color ?? 'blue',
          ticketCount: Number(c.ticketCount ?? 0),
          avgResolutionTime: c.avgResolutionTime ?? '—',
          slaTarget: c.slaTarget ?? '—',
        }))
        if (!cancelled) setCategories(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load categories')
          setCategories([])
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

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ticket Categories</h1>
          <p className="text-gray-600 mt-1">Manage support ticket categories and classification</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Category
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading categories…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && categories.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No categories found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                <Tag className={`h-6 w-6 text-${category.color}-600`} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{category.ticketCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Resolution:</span>
                <span className="font-medium text-gray-900">{category.avgResolutionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SLA Target:</span>
                <span className="font-medium text-gray-900">{category.slaTarget}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
