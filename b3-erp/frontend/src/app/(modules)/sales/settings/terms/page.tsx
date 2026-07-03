'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Plus, Edit, Trash2, Eye, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface TermsTemplate {
  id: string
  name: string
  type: 'general' | 'warranty' | 'return' | 'delivery' | 'payment' | 'custom'
  category: string
  content: string
  status: 'active' | 'draft' | 'archived'
  applicableTo: string[]
  createdDate: string
  lastModified: string
  usageCount: number
}

export default function TermsSettingsPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('all')

  const [templates, setTemplates] = useState<TermsTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getTermsTemplates()
        const mapped: TermsTemplate[] = (rows || []).map((r) => ({
          id: r.id,
          name: r.name,
          type: (r.type as TermsTemplate['type']) || 'general',
          category: r.category || '',
          content: r.content || '',
          status: (r.status as TermsTemplate['status']) || 'active',
          applicableTo: r.applicableTo || [],
          createdDate: r.createdAt || '',
          lastModified: r.updatedAt || '',
          usageCount: Number(r.usageCount) || 0,
        }))
        if (!cancelled) setTemplates(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load terms templates')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const termTypes = ['all', 'general', 'warranty', 'return', 'delivery', 'payment', 'custom']

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'warranty':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'return':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'delivery':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'payment':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'custom':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

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

  const filteredTemplates = templates.filter(template =>
    selectedType === 'all' || template.type === selectedType
  )

  const stats = {
    totalTemplates: templates.filter(t => t.status !== 'archived').length,
    activeTemplates: templates.filter(t => t.status === 'active').length,
    draftTemplates: templates.filter(t => t.status === 'draft').length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0)
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
            <p className="text-sm text-gray-600 mt-1">Manage sales terms and conditions templates</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Template
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Templates</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTemplates}</p>
              <p className="text-xs text-blue-100 mt-1">Active + Draft</p>
            </div>
            <FileText className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Active</p>
              <p className="text-3xl font-bold mt-1">{stats.activeTemplates}</p>
              <p className="text-xs text-green-100 mt-1">In use</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Draft</p>
              <p className="text-3xl font-bold mt-1">{stats.draftTemplates}</p>
              <p className="text-xs text-yellow-100 mt-1">Pending review</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Usage</p>
              <p className="text-3xl font-bold mt-1">{(stats.totalUsage / 1000).toFixed(1)}K</p>
              <p className="text-xs text-purple-100 mt-1">Times used</p>
            </div>
            <FileText className="h-10 w-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-wrap gap-2">
          {termTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{template.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(template.status)}`}>
                  {template.status.toUpperCase()}
                </span>
              </div>

              {/* Type Badge */}
              <div className="mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(template.type)}`}>
                  {template.type.toUpperCase()}
                </span>
              </div>

              {/* Content Preview */}
              <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-4">{template.content}</p>
              </div>

              {/* Applicable To */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2 font-medium">Applicable To:</p>
                <div className="flex flex-wrap gap-2">
                  {template.applicableTo.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{new Date(template.createdDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Modified</p>
                  <p className="font-medium text-gray-900">{new Date(template.lastModified).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Usage Count */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Usage Count</p>
                <p className="font-semibold text-blue-900">{template.usageCount.toLocaleString('en-IN')} times</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No templates found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
