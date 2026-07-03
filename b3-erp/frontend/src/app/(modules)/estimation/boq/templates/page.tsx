'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, FileText, Copy, Edit, Trash2, Download, Eye, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { exportToCsv } from '@/lib/export'

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
    exportToCsv(`boq-template-${template.templateCode}`, template.items)
  }

  const [templates] = useState<BOQTemplate[]>([
    {
      id: 'BOQ-TPL-001',
      name: 'Standard Modular Kitchen - 10x10 ft',
      templateCode: 'MK-STD-10X10',
      category: 'Modular Kitchen',
      projectType: 'Residential',
      description: 'Complete modular kitchen package for 10x10 ft space including cabinets, countertop, sink, and faucet',
      totalItems: 15,
      estimatedValue: 285000,
      lastUsed: '2025-10-18',
      createdDate: '2024-06-15',
      createdBy: 'Priya Sharma',
      status: 'active',
      usageCount: 45,
      items: [
        { itemNo: '1', description: 'Base Cabinet 24" with drawers', unit: 'nos', quantity: 4, rate: 18500, amount: 74000 },
        { itemNo: '2', description: 'Wall Cabinet 18" with glass doors', unit: 'nos', quantity: 3, rate: 15200, amount: 45600 },
        { itemNo: '3', description: 'Premium Quartz Countertop', unit: 'sqft', quantity: 40, rate: 850, amount: 34000 },
        { itemNo: '4', description: 'Stainless Steel Sink Double Bowl', unit: 'nos', quantity: 1, rate: 16500, amount: 16500 },
        { itemNo: '5', description: 'Brass Kitchen Faucet Pull-Out', unit: 'nos', quantity: 1, rate: 18500, amount: 18500 }
      ]
    },
    {
      id: 'BOQ-TPL-002',
      name: 'Premium Modular Kitchen - 12x12 ft',
      templateCode: 'MK-PREM-12X12',
      category: 'Modular Kitchen',
      projectType: 'Residential - Premium',
      description: 'Luxury modular kitchen with imported fittings, premium appliances, and designer countertops',
      totalItems: 22,
      estimatedValue: 585000,
      lastUsed: '2025-10-19',
      createdDate: '2024-08-10',
      createdBy: 'Rajesh Kumar',
      status: 'active',
      usageCount: 28,
      items: [
        { itemNo: '1', description: 'Premium Base Cabinet 30" soft-close', unit: 'nos', quantity: 5, rate: 28500, amount: 142500 },
        { itemNo: '2', description: 'Designer Wall Cabinet with LED', unit: 'nos', quantity: 4, rate: 22000, amount: 88000 },
        { itemNo: '3', description: 'Italian Marble Countertop', unit: 'sqft', quantity: 60, rate: 1200, amount: 72000 },
        { itemNo: '4', description: 'Chimney Hood 90cm Auto-Clean', unit: 'nos', quantity: 1, rate: 35000, amount: 35000 },
        { itemNo: '5', description: 'Built-in Oven & Microwave', unit: 'nos', quantity: 1, rate: 65000, amount: 65000 }
      ]
    },
    {
      id: 'BOQ-TPL-003',
      name: 'Budget Kitchen Package - 8x8 ft',
      templateCode: 'MK-BUD-8X8',
      category: 'Modular Kitchen',
      projectType: 'Residential - Economy',
      description: 'Cost-effective kitchen solution for small spaces with essential components',
      totalItems: 10,
      estimatedValue: 145000,
      lastUsed: '2025-10-15',
      createdDate: '2024-05-20',
      createdBy: 'Amit Patel',
      status: 'active',
      usageCount: 67,
      items: [
        { itemNo: '1', description: 'Base Cabinet 18" standard', unit: 'nos', quantity: 3, rate: 12500, amount: 37500 },
        { itemNo: '2', description: 'Wall Cabinet 15" plain doors', unit: 'nos', quantity: 2, rate: 9500, amount: 19000 },
        { itemNo: '3', description: 'Granite Countertop standard', unit: 'sqft', quantity: 25, rate: 450, amount: 11250 },
        { itemNo: '4', description: 'SS Sink Single Bowl', unit: 'nos', quantity: 1, rate: 11250, amount: 11250 },
        { itemNo: '5', description: 'Chrome Faucet Single Handle', unit: 'nos', quantity: 1, rate: 9750, amount: 9750 }
      ]
    },
    {
      id: 'BOQ-TPL-004',
      name: 'Commercial Kitchen - Restaurant Setup',
      templateCode: 'CK-REST-STD',
      category: 'Commercial Kitchen',
      projectType: 'Commercial',
      description: 'Complete restaurant kitchen setup with heavy-duty appliances and storage',
      totalItems: 18,
      estimatedValue: 1250000,
      lastUsed: '2025-10-12',
      createdDate: '2024-07-05',
      createdBy: 'Sneha Reddy',
      status: 'active',
      usageCount: 12,
      items: [
        { itemNo: '1', description: 'Commercial SS Work Table 6ft', unit: 'nos', quantity: 3, rate: 35000, amount: 105000 },
        { itemNo: '2', description: 'Heavy Duty Gas Range 4 Burner', unit: 'nos', quantity: 2, rate: 85000, amount: 170000 },
        { itemNo: '3', description: 'Commercial Chimney 120cm', unit: 'nos', quantity: 1, rate: 125000, amount: 125000 },
        { itemNo: '4', description: 'Deep Freezer 500L', unit: 'nos', quantity: 1, rate: 95000, amount: 95000 },
        { itemNo: '5', description: 'Commercial Sink 3 Compartment', unit: 'nos', quantity: 1, rate: 45000, amount: 45000 }
      ]
    },
    {
      id: 'BOQ-TPL-005',
      name: 'Kitchen Renovation Package',
      templateCode: 'KR-RENO-STD',
      category: 'Renovation',
      projectType: 'Residential',
      description: 'Kitchen renovation with countertop replacement, new appliances, and updated fittings',
      totalItems: 12,
      estimatedValue: 185000,
      lastUsed: '2025-10-17',
      createdDate: '2024-09-12',
      createdBy: 'Vikram Singh',
      status: 'active',
      usageCount: 34,
      items: [
        { itemNo: '1', description: 'Quartz Countertop Replacement', unit: 'sqft', quantity: 35, rate: 850, amount: 29750 },
        { itemNo: '2', description: 'Mixer Grinder 750W Premium', unit: 'nos', quantity: 1, rate: 12500, amount: 12500 },
        { itemNo: '3', description: 'Induction Cooktop 2000W', unit: 'nos', quantity: 1, rate: 8500, amount: 8500 },
        { itemNo: '4', description: 'Chimney Hood 60cm', unit: 'nos', quantity: 1, rate: 22000, amount: 22000 },
        { itemNo: '5', description: 'Kitchen Faucet Upgrade', unit: 'nos', quantity: 1, rate: 15000, amount: 15000 }
      ]
    },
    {
      id: 'BOQ-TPL-006',
      name: 'Builder Package - 3BHK Apartment',
      templateCode: 'BP-3BHK-STD',
      category: 'Builder Package',
      projectType: 'Builder Project',
      description: 'Standard kitchen package for 3BHK apartments in builder projects',
      totalItems: 16,
      estimatedValue: 195000,
      lastUsed: '2025-10-20',
      createdDate: '2024-04-18',
      createdBy: 'Priya Sharma',
      status: 'active',
      usageCount: 156,
      items: [
        { itemNo: '1', description: 'Base Cabinet 24" Melamine', unit: 'nos', quantity: 3, rate: 14500, amount: 43500 },
        { itemNo: '2', description: 'Wall Cabinet 18" Melamine', unit: 'nos', quantity: 2, rate: 11500, amount: 23000 },
        { itemNo: '3', description: 'Granite Countertop Builder Grade', unit: 'sqft', quantity: 30, rate: 420, amount: 12600 },
        { itemNo: '4', description: 'SS Sink Single Bowl Standard', unit: 'nos', quantity: 1, rate: 9500, amount: 9500 },
        { itemNo: '5', description: 'Faucet Chrome Finish Basic', unit: 'nos', quantity: 1, rate: 6500, amount: 6500 }
      ]
    },
    {
      id: 'BOQ-TPL-007',
      name: 'L-Shaped Kitchen - 14x10 ft',
      templateCode: 'MK-LSHAPE-14X10',
      category: 'Modular Kitchen',
      projectType: 'Residential',
      description: 'L-shaped modular kitchen design with optimized storage and workspace',
      totalItems: 19,
      estimatedValue: 425000,
      lastUsed: '2025-10-16',
      createdDate: '2024-07-22',
      createdBy: 'Rajesh Kumar',
      status: 'active',
      usageCount: 38,
      items: [
        { itemNo: '1', description: 'Base Cabinet 30" Corner Unit', unit: 'nos', quantity: 1, rate: 32000, amount: 32000 },
        { itemNo: '2', description: 'Base Cabinet 24" Regular', unit: 'nos', quantity: 5, rate: 18500, amount: 92500 },
        { itemNo: '3', description: 'Wall Cabinet L-Shape Design', unit: 'nos', quantity: 4, rate: 19500, amount: 78000 },
        { itemNo: '4', description: 'Quartz Countertop L-Shape', unit: 'sqft', quantity: 55, rate: 850, amount: 46750 },
        { itemNo: '5', description: 'Tall Unit with Pullout', unit: 'nos', quantity: 1, rate: 35000, amount: 35000 }
      ]
    },
    {
      id: 'BOQ-TPL-008',
      name: 'Island Kitchen - Premium',
      templateCode: 'MK-ISLAND-PREM',
      category: 'Modular Kitchen',
      projectType: 'Residential - Luxury',
      description: 'Designer island kitchen with breakfast counter and premium appliances',
      totalItems: 25,
      estimatedValue: 785000,
      lastUsed: '2025-10-10',
      createdDate: '2024-09-05',
      createdBy: 'Sneha Reddy',
      status: 'active',
      usageCount: 15,
      items: [
        { itemNo: '1', description: 'Island Cabinet with Breakfast Counter', unit: 'nos', quantity: 1, rate: 125000, amount: 125000 },
        { itemNo: '2', description: 'Premium Base Cabinets', unit: 'nos', quantity: 6, rate: 28500, amount: 171000 },
        { itemNo: '3', description: 'Wall Cabinets Glass + Wood', unit: 'nos', quantity: 5, rate: 24000, amount: 120000 },
        { itemNo: '4', description: 'Italian Marble Island Top', unit: 'sqft', quantity: 45, rate: 1500, amount: 67500 },
        { itemNo: '5', description: 'Chimney Island Model 90cm', unit: 'nos', quantity: 1, rate: 85000, amount: 85000 }
      ]
    },
    {
      id: 'BOQ-TPL-009',
      name: 'Hospital Kitchen - 50 Bed Capacity',
      templateCode: 'HK-50BED-STD',
      category: 'Institutional Kitchen',
      projectType: 'Healthcare',
      description: 'Institutional kitchen setup for hospital with hygiene standards compliance',
      totalItems: 20,
      estimatedValue: 985000,
      lastUsed: '2025-09-28',
      createdDate: '2024-08-15',
      createdBy: 'Amit Patel',
      status: 'active',
      usageCount: 8,
      items: [
        { itemNo: '1', description: 'SS Work Table Medical Grade', unit: 'nos', quantity: 4, rate: 42000, amount: 168000 },
        { itemNo: '2', description: 'Steam Cooker Commercial', unit: 'nos', quantity: 1, rate: 125000, amount: 125000 },
        { itemNo: '3', description: 'Food Warmer Cabinet', unit: 'nos', quantity: 2, rate: 55000, amount: 110000 },
        { itemNo: '4', description: 'Medical Grade Sink System', unit: 'nos', quantity: 2, rate: 38000, amount: 76000 },
        { itemNo: '5', description: 'Exhaust System Medical Grade', unit: 'nos', quantity: 1, rate: 145000, amount: 145000 }
      ]
    },
    {
      id: 'BOQ-TPL-010',
      name: 'U-Shaped Kitchen - 16x12 ft',
      templateCode: 'MK-USHAPE-16X12',
      category: 'Modular Kitchen',
      projectType: 'Residential',
      description: 'U-shaped kitchen layout with maximum storage and counter space',
      totalItems: 21,
      estimatedValue: 495000,
      lastUsed: '2025-10-14',
      createdDate: '2024-06-28',
      createdBy: 'Vikram Singh',
      status: 'active',
      usageCount: 42,
      items: [
        { itemNo: '1', description: 'Base Cabinet Corner Carousel', unit: 'nos', quantity: 2, rate: 35000, amount: 70000 },
        { itemNo: '2', description: 'Base Cabinet 24" Soft Close', unit: 'nos', quantity: 6, rate: 18500, amount: 111000 },
        { itemNo: '3', description: 'Wall Cabinet U-Shape Layout', unit: 'nos', quantity: 6, rate: 16500, amount: 99000 },
        { itemNo: '4', description: 'Quartz Countertop U-Shape', unit: 'sqft', quantity: 70, rate: 850, amount: 59500 },
        { itemNo: '5', description: 'Tall Units Pantry Style', unit: 'nos', quantity: 2, rate: 32000, amount: 64000 }
      ]
    }
  ])

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
