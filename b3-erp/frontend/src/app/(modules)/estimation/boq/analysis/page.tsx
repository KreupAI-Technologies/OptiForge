'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign, Percent, Package, FileText, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { estimationBOQService } from '@/services/estimation-boq.service'

// Maps the backend BOQ status vocabulary onto this page's status set.
const STATUS_MAP: Record<string, BOQAnalysis['status']> = {
  Draft: 'draft',
  'Under Review': 'submitted',
  Approved: 'approved',
  Rejected: 'draft',
}

interface BOQAnalysis {
  id: string
  projectName: string
  projectCode: string
  location: string
  totalValue: number
  categories: CategoryBreakdown[]
  profitMargin: number
  overheadCost: number
  materialCost: number
  laborCost: number
  contingency: number
  createdDate: string
  status: 'draft' | 'submitted' | 'approved'
}

interface CategoryBreakdown {
  category: string
  value: number
  percentage: number
  items: number
  trend: 'up' | 'down' | 'stable'
  variance: number
}

export default function BOQAnalysisPage() {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState('')
  const [projects, setProjects] = useState<BOQAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await estimationBOQService.findAll()
        const mapped: BOQAnalysis[] = (Array.isArray(rows) ? rows : []).map((b: any) => ({
          id: String(b.id ?? ''),
          projectName: b.projectName ?? '—',
          projectCode: b.boqNumber ?? '',
          location: b.projectLocation ?? '—',
          totalValue: Number(b.estimatedValue ?? 0),
          materialCost: Number(b.materialCost ?? 0),
          laborCost: Number(b.laborCost ?? 0),
          overheadCost: Number(b.overheadCost ?? 0),
          contingency: Number(b.contingency ?? 0),
          profitMargin: Number(b.profitMargin ?? 0),
          categories: Array.isArray(b.categories) ? b.categories : [],
          createdDate: (b.createdAt ?? '').toString().slice(0, 10),
          status: STATUS_MAP[b.status] ?? 'draft',
        }))
        if (!cancelled) {
          setProjects(mapped)
          if (mapped.length > 0) setSelectedProject(mapped[0].id)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load BOQ analysis')
          setProjects([])
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

  const selectedProjectData = projects.find(p => p.id === selectedProject) ?? projects[0]

  const costBreakdown = selectedProjectData
    ? [
        { label: 'Material Cost', value: selectedProjectData.materialCost, percentage: selectedProjectData.totalValue ? (selectedProjectData.materialCost / selectedProjectData.totalValue) * 100 : 0, color: 'blue' },
        { label: 'Labor Cost', value: selectedProjectData.laborCost, percentage: selectedProjectData.totalValue ? (selectedProjectData.laborCost / selectedProjectData.totalValue) * 100 : 0, color: 'green' },
        { label: 'Overhead', value: selectedProjectData.overheadCost, percentage: selectedProjectData.totalValue ? (selectedProjectData.overheadCost / selectedProjectData.totalValue) * 100 : 0, color: 'purple' },
        { label: 'Contingency', value: selectedProjectData.contingency, percentage: selectedProjectData.totalValue ? (selectedProjectData.contingency / selectedProjectData.totalValue) * 100 : 0, color: 'orange' },
      ]
    : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'submitted':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
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
            <h1 className="text-2xl font-bold text-gray-900">BOQ Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">Detailed cost analysis and breakdown for kitchen projects</p>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.projectCode} - {project.projectName} ({project.location})
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading BOQ analysis…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && !selectedProjectData && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No BOQ records found.
        </div>
      )}

      {selectedProjectData && (
        <>
      {/* Project Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedProjectData.projectName}</h2>
            <p className="text-sm text-gray-600 mt-1">{selectedProjectData.projectCode} • {selectedProjectData.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedProjectData.status)}`}>
            {selectedProjectData.status.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Project Value</p>
            <p className="text-2xl font-bold text-blue-900">₹{(selectedProjectData.totalValue / 100000).toFixed(2)}L</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Material Cost</p>
            <p className="text-2xl font-bold text-green-900">₹{(selectedProjectData.materialCost / 100000).toFixed(2)}L</p>
            <p className="text-xs text-green-700 mt-1">{((selectedProjectData.materialCost / selectedProjectData.totalValue) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Labor Cost</p>
            <p className="text-2xl font-bold text-purple-900">₹{(selectedProjectData.laborCost / 100000).toFixed(2)}L</p>
            <p className="text-xs text-purple-700 mt-1">{((selectedProjectData.laborCost / selectedProjectData.totalValue) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-orange-900">{selectedProjectData.profitMargin}%</p>
            <p className="text-xs text-orange-700 mt-1">₹{((selectedProjectData.totalValue * selectedProjectData.profitMargin) / 100 / 1000).toFixed(0)}K profit</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
          <PieChart className="h-5 w-5 text-gray-600" />
        </div>
        <div className="space-y-2">
          {costBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">₹{(item.value / 100000).toFixed(2)}L</span>
                  <span className="font-semibold text-gray-900 w-16 text-right">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`absolute top-0 left-0 h-3 rounded-full bg-${item.color}-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category-wise Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Category-wise Analysis</h2>
          <BarChart3 className="h-5 w-5 text-gray-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {selectedProjectData.categories.map((category, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{category.items} items</p>
                </div>
                {getTrendIcon(category.trend)}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <p className="text-xs text-blue-700">Value</p>
                  <p className="font-bold text-blue-900">₹{(category.value / 100000).toFixed(2)}L</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                  <p className="text-xs text-purple-700">% of Total</p>
                  <p className="font-bold text-purple-900">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="absolute top-0 left-0 h-2 rounded-full bg-blue-500"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>

              {category.variance !== 0 && (
                <div className={`mt-2 p-2 rounded text-xs ${category.variance > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {category.variance > 0 ? '↑' : '↓'} {Math.abs(category.variance)}% variance from estimate
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-200 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-700" />
            </div>
            <h3 className="font-semibold text-indigo-900">Total Investment</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-900 mb-2">₹{(selectedProjectData.totalValue / 100000).toFixed(2)}L</p>
          <div className="space-y-1 text-sm">
            <p className="text-indigo-700">Direct Costs: ₹{((selectedProjectData.materialCost + selectedProjectData.laborCost) / 100000).toFixed(2)}L</p>
            <p className="text-indigo-700">Indirect Costs: ₹{((selectedProjectData.overheadCost + selectedProjectData.contingency) / 100000).toFixed(2)}L</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-200 rounded-lg">
              <Percent className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="font-semibold text-green-900">Profitability</h3>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-2">{selectedProjectData.profitMargin}%</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-700">Profit Amount: ₹{((selectedProjectData.totalValue * selectedProjectData.profitMargin) / 100 / 1000).toFixed(0)}K</p>
            <p className="text-green-700">ROI: {(selectedProjectData.profitMargin / (100 - selectedProjectData.profitMargin) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-200 rounded-lg">
              <FileText className="h-6 w-6 text-orange-700" />
            </div>
            <h3 className="font-semibold text-orange-900">Risk Buffer</h3>
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-2">₹{(selectedProjectData.contingency / 1000).toFixed(0)}K</p>
          <div className="space-y-1 text-sm">
            <p className="text-orange-700">Contingency: {((selectedProjectData.contingency / selectedProjectData.totalValue) * 100).toFixed(1)}%</p>
            <p className="text-orange-700">Overhead: ₹{(selectedProjectData.overheadCost / 1000).toFixed(0)}K</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
