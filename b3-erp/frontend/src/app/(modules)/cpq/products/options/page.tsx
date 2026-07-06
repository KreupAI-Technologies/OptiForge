'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sliders,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Tag
} from 'lucide-react'
import {
  OptionModal,
  ViewOptionModal,
  FilterModal
} from '@/components/cpq/OptionModals'
import { cpqProductService } from '@/services/cpq/cpq-product.service'

interface ProductOption {
  id: string
  name: string
  category: string
  type: 'dropdown' | 'checkbox' | 'radio' | 'text'
  required: boolean
  priceImpact: number
  options: string[]
  status: 'active' | 'inactive'
}

export default function CPQProductsOptionsPage() {
  const router = useRouter()

  const [productOptions, setProductOptions] = useState<ProductOption[]>([
    {
      id: 'OPT-001',
      name: 'Cabinet Finish',
      category: 'Cabinets',
      type: 'dropdown',
      required: true,
      priceImpact: 50000,
      options: ['Matte', 'Glossy', 'Textured', 'Metallic'],
      status: 'active'
    },
    {
      id: 'OPT-002',
      name: 'Handle Type',
      category: 'Hardware',
      type: 'radio',
      required: true,
      priceImpact: 15000,
      options: ['Standard Pull', 'Designer Handle', 'Push-to-Open', 'Integrated'],
      status: 'active'
    },
    {
      id: 'OPT-003',
      name: 'Lighting Package',
      category: 'Electrical',
      type: 'checkbox',
      required: false,
      priceImpact: 45000,
      options: ['Under-cabinet LED', 'Task Lighting', 'Ambient Lighting', 'Smart Controls'],
      status: 'active'
    },
    {
      id: 'OPT-004',
      name: 'Backsplash Material',
      category: 'Finishes',
      type: 'dropdown',
      required: true,
      priceImpact: 35000,
      options: ['Ceramic Tiles', 'Glass', 'Stone', 'Stainless Steel'],
      status: 'active'
    },
    {
      id: 'OPT-005',
      name: 'Sink Configuration',
      category: 'Fixtures',
      type: 'radio',
      required: true,
      priceImpact: 25000,
      options: ['Single Bowl', 'Double Bowl', 'Triple Bowl', 'Undermount'],
      status: 'active'
    },
    {
      id: 'OPT-006',
      name: 'Storage Accessories',
      category: 'Accessories',
      type: 'checkbox',
      required: false,
      priceImpact: 30000,
      options: ['Pull-out Drawers', 'Corner Solutions', 'Spice Racks', 'Cutlery Organizers'],
      status: 'active'
    }
  ])

  // Modal states
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<any>(null)
  const [productId, setProductId] = useState<string>('default')

  const mapOption = (o: any): ProductOption => ({
    id: (o.id ?? '') as string,
    name: (o.optionName ?? o.name ?? '') as string,
    category: (o.optionGroupName ?? o.category ?? '') as string,
    type: (o.optionType === 'multi_select'
      ? 'checkbox'
      : o.optionType === 'single_select'
      ? 'dropdown'
      : o.type ?? 'dropdown') as any,
    required: Boolean(o.isRequired ?? o.required ?? false),
    priceImpact: Number(o.priceImpact ?? 0) || 0,
    options: Array.isArray(o.values)
      ? o.values.map((v: any) => (v.label ?? v.value ?? '') as string)
      : Array.isArray(o.options)
      ? o.options
      : [],
    status: ((o.isActive ?? true) ? 'active' : 'inactive') as any
  })

  useEffect(() => {
    let mounted = true
    cpqProductService.findAllProducts().then((products) => {
      const list = Array.isArray(products) ? products : []
      const first = list[0]
      const pid = (first as any)?.id ?? 'default'
      if (mounted) setProductId(pid)
      return cpqProductService.findProductOptions(pid)
    }).then((opts) => {
      const list = Array.isArray(opts) ? opts : []
      if (!mounted || list.length === 0) return
      setProductOptions(list.map(mapOption))
    }).catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const getTypeColor = (type: string) => {
    const colors: any = {
      dropdown: 'bg-blue-100 text-blue-700 border-blue-200',
      checkbox: 'bg-green-100 text-green-700 border-green-200',
      radio: 'bg-purple-100 text-purple-700 border-purple-200',
      text: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[type] || colors.dropdown
  }

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200'
  }

  // Handlers
  const handleAddOption = () => {
    setSelectedOption(null)
    setIsOptionModalOpen(true)
  }

  const handleEditOption = (option: ProductOption) => {
    setSelectedOption(option)
    setIsOptionModalOpen(true)
  }

  const handleViewOption = (option: ProductOption) => {
    setSelectedOption(option)
    setIsViewModalOpen(true)
  }

  const handleSaveOption = (optionData: Partial<ProductOption>) => {
    if (selectedOption) {
      // Update existing option
      setProductOptions(productOptions.map(o =>
        o.id === selectedOption.id
          ? { ...o, ...optionData }
          : o
      ))
    } else {
      // Create new option
      const newOption: ProductOption = {
        ...optionData as ProductOption,
        id: `OPT-${String(productOptions.length + 1).padStart(3, '0')}`
      }
      cpqProductService.createOption(productId || 'default', {
        optionName: (optionData as any).name ?? '',
        optionGroupName: (optionData as any).category ?? '',
        isRequired: Boolean((optionData as any).required ?? false),
        priceImpact: Number((optionData as any).priceImpact ?? 0) || 0
      } as any).catch(() => {})
      setProductOptions([...productOptions, newOption])
    }
  }

  const handleToggleStatus = (option: ProductOption) => {
    setProductOptions(productOptions.map(o =>
      o.id === option.id
        ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' }
        : o
    ))
  }

  const handleExport = () => {
    const data = filteredOptions.map(o => ({
      ID: o.id,
      Name: o.name,
      Category: o.category,
      Type: o.type,
      Required: o.required ? 'Yes' : 'No',
      'Price Impact': o.priceImpact,
      'Available Choices': o.options.join('; '),
      Status: o.status
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v =>
        typeof v === 'string' && v.includes(',') ? `"${v}"` : v
      ).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `product-options-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredOptions = productOptions.filter(option => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Advanced filters
    let matchesFilters = true
    if (appliedFilters) {
      // Categories filter
      if (appliedFilters.categories.length > 0 && !appliedFilters.categories.includes(option.category)) {
        matchesFilters = false
      }

      // Types filter
      if (appliedFilters.types.length > 0 && !appliedFilters.types.includes(option.type)) {
        matchesFilters = false
      }

      // Required filter
      if (appliedFilters.required === 'required' && !option.required) {
        matchesFilters = false
      }
      if (appliedFilters.required === 'optional' && option.required) {
        matchesFilters = false
      }

      // Status filter
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(option.status)) {
        matchesFilters = false
      }

      // Price impact filter (in thousands)
      const priceImpactInK = option.priceImpact / 1000
      if (appliedFilters.minPriceImpact && priceImpactInK < parseFloat(appliedFilters.minPriceImpact)) {
        matchesFilters = false
      }
      if (appliedFilters.maxPriceImpact && priceImpactInK > parseFloat(appliedFilters.maxPriceImpact)) {
        matchesFilters = false
      }
    }

    return matchesSearch && matchesFilters
  })

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleAddOption}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Options</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredOptions.length}</p>
              <p className="text-xs text-blue-700 mt-1">
                {filteredOptions.length === productOptions.length ? 'Configuration fields' : `of ${productOptions.length} total`}
              </p>
            </div>
            <Sliders className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Options</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {filteredOptions.filter(o => o.status === 'active').length}
              </p>
              <p className="text-xs text-green-700 mt-1">Currently available</p>
            </div>
            <ToggleRight className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Required Options</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {filteredOptions.filter(o => o.required).length}
              </p>
              <p className="text-xs text-purple-700 mt-1">Mandatory fields</p>
            </div>
            <Tag className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Price Impact</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                ₹{filteredOptions.length > 0
                  ? (filteredOptions.reduce((sum, o) => sum + o.priceImpact, 0) / filteredOptions.length / 1000).toFixed(0)
                  : 0}K
              </p>
              <p className="text-xs text-orange-700 mt-1">Per option</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product options..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Options Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Option Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Required</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price Impact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Choices</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Sliders className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 text-lg">No options found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchQuery || appliedFilters
                        ? 'Try adjusting your search or filters'
                        : 'Create your first product option to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOptions.map((option) => (
                  <tr
                    key={option.id}
                    onClick={() => handleViewOption(option)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{option.name}</div>
                      <div className="text-xs text-gray-500">{option.id}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{option.category}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTypeColor(option.type)}`}>
                        {option.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {option.required ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-red-100 text-red-700 border-red-200">
                          Required
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{(option.priceImpact / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-700 max-w-xs">
                        {option.options.slice(0, 2).join(', ')}
                        {option.options.length > 2 && ` +${option.options.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(option.status)}`}>
                        {option.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditOption(option)
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(option)
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title={option.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {option.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        onSave={handleSaveOption}
        option={selectedOption}
      />

      <ViewOptionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        option={selectedOption}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsOptionModalOpen(true)
        }}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
