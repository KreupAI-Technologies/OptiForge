'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { estimationTemplateService } from '@/services/estimation-template.service'
import {
  FileText,
  Edit2,
  Copy,
  Trash2,
  Eye,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Star
} from 'lucide-react'

interface EstimateTemplate {
  id: string
  templateCode: string
  templateName: string
  category: string
  description: string
  sections: number
  lineItems: number
  defaultMarkup: number
  usageCount: number
  lastUsed: string
  createdBy: string
  createdDate: string
  isDefault: boolean
  status: 'active' | 'draft' | 'archived'
}

export default function EstimationSettingsTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EstimateTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns raw EstimateTemplate[]; map to the page's view model.
        const raw = await estimationTemplateService.findAllTemplates()
        const mapped: EstimateTemplate[] = (raw as any[]).map((t) => {
          const sectionCount = Array.isArray(t.sections) ? t.sections.length : 0
          const lineItems = Array.isArray(t.sections)
            ? t.sections.reduce(
                (sum: number, s: any) => sum + (Array.isArray(s?.items) ? s.items.length : 0),
                0,
              )
            : 0
          const defaultMarkup = Array.isArray(t.defaultMarkups) && t.defaultMarkups.length > 0
            ? Number(t.defaultMarkups[0].markupPercentage ?? 0)
            : 0
          return {
            id: t.id,
            templateCode: t.id ? String(t.id).slice(0, 8).toUpperCase() : '',
            templateName: t.name ?? '',
            category: t.category ?? '',
            description: t.description ?? '',
            sections: sectionCount,
            lineItems,
            defaultMarkup,
            usageCount: Number(t.usageCount ?? 0),
            lastUsed: t.lastUsedAt ?? '',
            createdBy: t.createdBy ?? '',
            createdDate: t.createdAt ?? '',
            isDefault: t.isDefault === true,
            status: t.isActive === false ? 'archived' : 'active',
          }
        })
        if (!cancelled) setTemplates(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load templates')
          setTemplates([])
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


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalTemplates = templates.length
  const activeTemplates = templates.filter(t => t.status === 'active').length
  const defaultTemplates = templates.filter(t => t.isDefault).length
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0)

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estimate Templates</h1>
            <p className="text-sm text-gray-600 mt-1">Pre-configured templates for quick estimates</p>
          </div>
        </div>
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
            New Template
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading templates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && templates.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No templates found.
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Templates</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalTemplates}</p>
              <p className="text-xs text-blue-700 mt-1">All templates</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeTemplates}</p>
              <p className="text-xs text-green-700 mt-1">Ready to use</p>
            </div>
            <FileText className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Default Templates</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{defaultTemplates}</p>
              <p className="text-xs text-purple-700 mt-1">Category defaults</p>
            </div>
            <Star className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Usage</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{totalUsage}</p>
              <p className="text-xs text-orange-700 mt-1">Times used</p>
            </div>
            <FileText className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {template.templateCode}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(template.status)}`}>
                      {template.status.toUpperCase()}
                    </span>
                    {template.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{template.templateName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">{template.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Sections</p>
                  <p className="text-lg font-bold text-blue-900">{template.sections}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Line Items</p>
                  <p className="text-lg font-bold text-green-900">{template.lineItems}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Default Markup</p>
                  <p className="text-lg font-bold text-purple-900">{template.defaultMarkup}%</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Usage Count</p>
                  <p className="text-lg font-bold text-orange-900">{template.usageCount}</p>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-2 space-y-1">
                <p>Created by {template.createdBy} on {template.createdDate}</p>
                <p>Last used: {template.lastUsed}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Edit2 className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Edit</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Copy className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Copy</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
