'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, FileText, Copy, Edit, Trash2, Download, Eye, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'
import { estimationTemplateService } from '@/services/estimation-template.service'

interface BOQTemplate {
  id: string
  name: string
  templateCode: string
  category: string
  projectType: string
  description: string
  totalItems: number
  estimatedValue: number
  lastUsed: string
  createdDate: string
  createdBy: string
  status: 'active' | 'draft' | 'archived'
  usageCount: number
  items: BOQItem[]
}

interface BOQItem {
  itemNo: string
  description: string
  unit: string
  quantity: number
  rate: number
  amount: number
}

export default function BOQTemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleCreateTemplate = () => {
    router.push('/estimation/boq/templates/create')
  }

  const handleViewTemplate = (templateId: string) => {
    router.push(`/estimation/boq/templates/view/${templateId}`)
  }

  const handleEditTemplate = (templateId: string) => {
    router.push(`/estimation/boq/templates/edit/${templateId}`)
  }

  const handleUseTemplate = (templateId: string) => {
    router.push(`/estimation/boq/create?template=${templateId}`)
  }

  const handleExportTemplate = (template: BOQTemplate) => {
    exportToCsv(`boq-template-${template.templateCode}`, Array.isArray(template.items) ? template.items : [])
  }

  const [templates, setTemplates] = useState<BOQTemplate[]>([])

  const mapTemplate = (t: any): BOQTemplate => {
    const items: BOQItem[] = Array.isArray(t?.items)
      ? t.items.map((it: any) => ({
          itemNo: String(it?.itemNo ?? it?.itemCode ?? ''),
          description: it?.description ?? '',
          unit: it?.unit ?? '',
          quantity: Number(it?.quantity ?? 0),
          rate: Number(it?.rate ?? it?.unitRate ?? 0),
          amount: Number(it?.amount ?? it?.totalAmount ?? 0),
        }))
      : []
    return {
      id: t?.id ?? '',
      name: t?.name ?? '',
      templateCode: t?.templateCode ?? t?.code ?? t?.id ?? '',
      category: t?.category ?? t?.templateType ?? 'Other',
      projectType: t?.projectType ?? '',
      description: t?.description ?? '',
      totalItems: t?.totalItems != null ? Number(t.totalItems) : items.length,
      estimatedValue: Number(t?.estimatedValue ?? 0),
      lastUsed: t?.lastUsedAt ?? t?.lastUsed ?? '',
      createdDate: t?.createdAt ?? t?.createdDate ?? '',
      createdBy: t?.createdBy ?? '',
      status: (t?.isActive === false ? 'archived' : (t?.status ?? 'active')) as BOQTemplate['status'],
      usageCount: Number(t?.usageCount ?? 0),
      items,
    }
  }

  const loadTemplates = async () => {
    try {
      const res = await estimationTemplateService.findAllTemplates()
      setTemplates((Array.isArray(res) ? res : []).map(mapTemplate))
    } catch (error) {
      console.error('Error loading BOQ templates:', error)
      setTemplates([])
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    try {
      await estimationTemplateService.deleteBoqTemplate(templateId)
      await loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template. Please try again.')
    }
  }

  const categories = ['all', 'Modular Kitchen', 'Commercial Kitchen', 'Renovation', 'Builder Package', 'Institutional Kitchen']

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
    selectedCategory === 'all' || template.category === selectedCategory
  )

  const stats = {
    totalTemplates: templates.filter(t => t.status === 'active').length,
    avgValue: templates.reduce((sum, t) => sum + t.estimatedValue, 0) / templates.length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    avgItems: templates.reduce((sum, t) => sum + t.totalItems, 0) / templates.length
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
            <h1 className="text-2xl font-bold text-gray-900">BOQ Templates</h1>
            <p className="text-sm text-gray-600 mt-1">Pre-configured Bill of Quantities templates for kitchen projects</p>
          </div>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Template
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Active Templates</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTemplates}</p>
              <p className="text-xs text-blue-100 mt-1">Ready to use</p>
            </div>
            <FileText className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Avg Value</p>
              <p className="text-3xl font-bold mt-1">₹{(stats.avgValue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-green-100 mt-1">Per template</p>
            </div>
            <FileText className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Usage</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsage}</p>
              <p className="text-xs text-purple-100 mt-1">Times used</p>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Avg Items</p>
              <p className="text-3xl font-bold mt-1">{Math.round(stats.avgItems)}</p>
              <p className="text-xs text-orange-100 mt-1">Per template</p>
            </div>
            <FileText className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category === 'all' ? 'All Categories' : category}
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
                  <p className="text-sm text-gray-600 font-mono">{template.templateCode}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(template.status)}`}>
                  {template.status.toUpperCase()}
                </span>
              </div>

              {/* Category & Project Type */}
              <div className="flex gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {template.category}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {template.projectType}
                </span>
              </div>

              {/* Description */}
              <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">{template.description}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Estimated Value</p>
                  <p className="font-bold text-green-900">₹{(template.estimatedValue / 100000).toFixed(2)}L</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">Total Items</p>
                  <p className="font-bold text-blue-900">{template.totalItems} items</p>
                </div>
              </div>

              {/* Sample Items Preview */}
              <div className="mb-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs text-indigo-700 mb-2 font-medium">Sample Items (Top 5):</p>
                <div className="space-y-1">
                  {template.items.map((item, index) => (
                    <div key={index} className="text-xs text-indigo-900 flex justify-between">
                      <span className="truncate flex-1">{item.itemNo}. {item.description}</span>
                      <span className="font-semibold ml-2">₹{(item.amount / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
                <div>
                  <p className="text-gray-600">Created By</p>
                  <p className="font-medium text-gray-900">{template.createdBy}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Used</p>
                  <p className="font-medium text-gray-900">{new Date(template.lastUsed).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Usage Count */}
              <div className="mb-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-orange-700 font-medium">Usage Count</p>
                  <p className="font-semibold text-orange-900">{template.usageCount} projects</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleViewTemplate(template.id)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Use Template
                </button>
                <button
                  onClick={() => handleEditTemplate(template.id)}
                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleExportTemplate(template)}
                  className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 col-span-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No templates found for selected category</p>
        </div>
      )}
    </div>
  )
}
