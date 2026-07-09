'use client'

import { useState } from 'react'
import { X, Download, FileText, FileSpreadsheet, Database, Calendar, Filter, CheckCircle, AlertCircle } from 'lucide-react'

// ==================== INTERFACES ====================

export interface ExportStockDataConfig {
  exportType: 'current-stock' | 'low-stock' | 'valuation' | 'movement-history'
  format: 'excel' | 'pdf' | 'csv'
  dateRange?: {
    start: string
    end: string
  }
  filters: {
    categories: string[]
    warehouses: string[]
    status: string[]
    includeZeroStock: boolean
  }
  includeFields: string[]
}

export interface ExportMovementReportConfig {
  reportType: 'summary' | 'detailed' | 'by-item'
  dateRange: {
    start: string
    end: string
  }
  movementTypes: string[]
  format: 'excel' | 'pdf' | 'csv'
  groupBy?: 'date' | 'item' | 'location' | 'type'
  includeCharts: boolean
}

export interface ExportValuationConfig {
  valuationDate: string
  valuationMethod: 'FIFO' | 'LIFO' | 'Weighted Average' | 'All'
  categories: string[]
  warehouses: string[]
  format: 'excel' | 'pdf'
  includeDetails: boolean
  includeSummary: boolean
}

// ==================== MODAL 1: EXPORT STOCK DATA ====================

interface ExportStockDataModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportStockDataConfig) => void
}

export function ExportStockDataModal({ isOpen, onClose, onExport }: ExportStockDataModalProps) {
  const [config, setConfig] = useState<ExportStockDataConfig>({
    exportType: 'current-stock',
    format: 'excel',
    filters: {
      categories: [],
      warehouses: [],
      status: ['active'],
      includeZeroStock: false
    },
    includeFields: ['itemCode', 'itemName', 'category', 'quantity', 'uom', 'location', 'value']
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (config.exportType === 'movement-history' && !config.dateRange) {
      newErrors.dateRange = 'Date range is required for movement history'
    }

    if (config.dateRange) {
      if (!config.dateRange.start || !config.dateRange.end) {
        newErrors.dateRange = 'Both start and end dates are required'
      } else if (new Date(config.dateRange.start) > new Date(config.dateRange.end)) {
        newErrors.dateRange = 'Start date must be before end date'
      }
    }

    if (config.includeFields.length === 0) {
      newErrors.includeFields = 'Select at least one field to include'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleExport = async () => {
    if (validate()) {
      setIsLoading(true)
      try {
        await onExport(config)
      } finally {
        setIsLoading(false)
        onClose()
      }
    }
  }

  const toggleCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        categories: prev.filters.categories.includes(category)
          ? prev.filters.categories.filter(c => c !== category)
          : [...prev.filters.categories, category]
      }
    }))
  }

  const toggleWarehouse = (warehouse: string) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        warehouses: prev.filters.warehouses.includes(warehouse)
          ? prev.filters.warehouses.filter(w => w !== warehouse)
          : [...prev.filters.warehouses, warehouse]
      }
    }))
  }

  const toggleField = (field: string) => {
    setConfig(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(field)
        ? prev.includeFields.filter(f => f !== field)
        : [...prev.includeFields, field]
    }))
  }

  if (!isOpen) return null

  const availableFields = [
    { id: 'itemCode', label: 'Item Code' },
    { id: 'itemName', label: 'Item Name' },
    { id: 'description', label: 'Description' },
    { id: 'category', label: 'Category' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'uom', label: 'Unit of Measure' },
    { id: 'location', label: 'Location' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'costPrice', label: 'Cost Price' },
    { id: 'sellingPrice', label: 'Selling Price' },
    { id: 'value', label: 'Total Value' },
    { id: 'minLevel', label: 'Min Level' },
    { id: 'maxLevel', label: 'Max Level' },
    { id: 'reorderPoint', label: 'Reorder Point' },
    { id: 'lastUpdated', label: 'Last Updated' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Export Stock Data</h2>
              <p className="text-sm text-green-100">Download inventory data in your preferred format</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-green-800 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'current-stock', label: 'Current Stock Levels', desc: 'All items with current quantities' },
                { value: 'low-stock', label: 'Low Stock Items', desc: 'Items below reorder point' },
                { value: 'valuation', label: 'Stock Valuation', desc: 'Inventory value report' },
                { value: 'movement-history', label: 'Movement History', desc: 'Transaction history' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setConfig({ ...config, exportType: type.value as any })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    config.exportType === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <p className={`font-medium ${config.exportType === type.value ? 'text-green-900' : 'text-gray-900'}`}>
                    {type.label}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range (for movement history) */}
          {config.exportType === 'movement-history' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Date Range <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={config.dateRange?.start || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      dateRange: { ...config.dateRange!, start: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.dateRange ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={config.dateRange?.end || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      dateRange: { ...config.dateRange!, end: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.dateRange ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              {errors.dateRange && <p className="text-red-500 text-sm mt-1">{errors.dateRange}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 7)
                    setConfig({ ...config, dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } })
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 30)
                    setConfig({ ...config, dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } })
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 3)
                    setConfig({ ...config, dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } })
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Last Quarter
                </button>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: '.xlsx' },
                { value: 'pdf', label: 'PDF', icon: FileText, desc: '.pdf' },
                { value: 'csv', label: 'CSV', icon: Database, desc: '.csv' }
              ].map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.value}
                    onClick={() => setConfig({ ...config, format: format.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.format === format.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${config.format === format.value ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`font-medium text-center ${config.format === format.value ? 'text-green-900' : 'text-gray-700'}`}>
                      {format.label}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">{format.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </label>

            {/* Categories */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {['Raw Materials', 'Work in Progress', 'Finished Goods', 'Consumables', 'Spare Parts', 'Packaging'].map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.filters.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {config.filters.categories.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No filter - all categories will be included</p>
              )}
            </div>

            {/* Warehouses */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Warehouses</p>
              <div className="flex flex-wrap gap-2">
                {['WH-01', 'WH-02', 'WH-03'].map((warehouse) => (
                  <label key={warehouse} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.filters.warehouses.includes(warehouse)}
                      onChange={() => toggleWarehouse(warehouse)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{warehouse}</span>
                  </label>
                ))}
              </div>
              {config.filters.warehouses.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No filter - all warehouses will be included</p>
              )}
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.filters.includeZeroStock}
                  onChange={(e) => setConfig({
                    ...config,
                    filters: { ...config.filters, includeZeroStock: e.target.checked }
                  })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Include items with zero stock</span>
              </label>
            </div>
          </div>

          {/* Include Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include Fields <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFields.map((field) => (
                <label key={field.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeFields.includes(field.id)}
                    onChange={() => toggleField(field.id)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
            {errors.includeFields && <p className="text-red-500 text-sm mt-1">{errors.includeFields}</p>}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setConfig({ ...config, includeFields: availableFields.map(f => f.id) })}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setConfig({ ...config, includeFields: [] })}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Export Summary</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Type: {config.exportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                  <li>• Format: {config.format.toUpperCase()}</li>
                  <li>• Fields: {config.includeFields.length} selected</li>
                  {config.filters.categories.length > 0 && <li>• Categories: {config.filters.categories.length} selected</li>}
                  {config.filters.warehouses.length > 0 && <li>• Warehouses: {config.filters.warehouses.length} selected</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MODAL 2: EXPORT MOVEMENT REPORT ====================

interface ExportMovementReportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportMovementReportConfig) => void
}

export function ExportMovementReportModal({ isOpen, onClose, onExport }: ExportMovementReportModalProps) {
  const [config, setConfig] = useState<ExportMovementReportConfig>({
    reportType: 'summary',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    movementTypes: ['receipt', 'issue', 'transfer'],
    format: 'excel',
    groupBy: 'date',
    includeCharts: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!config.dateRange.start || !config.dateRange.end) {
      newErrors.dateRange = 'Both start and end dates are required'
    } else if (new Date(config.dateRange.start) > new Date(config.dateRange.end)) {
      newErrors.dateRange = 'Start date must be before end date'
    }

    if (config.movementTypes.length === 0) {
      newErrors.movementTypes = 'Select at least one movement type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleExport = async () => {
    if (validate()) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      onExport(config)
      setIsLoading(false)
      onClose()
    }
  }

  const toggleMovementType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      movementTypes: prev.movementTypes.includes(type)
        ? prev.movementTypes.filter(t => t !== type)
        : [...prev.movementTypes, type]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Export Movement Report</h2>
              <p className="text-sm text-blue-100">Download inventory movement history</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'summary', label: 'Summary', desc: 'Aggregated totals' },
                { value: 'detailed', label: 'Detailed', desc: 'All transactions' },
                { value: 'by-item', label: 'By Item', desc: 'Item-wise report' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setConfig({ ...config, reportType: type.value as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.reportType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <p className={`font-medium ${config.reportType === type.value ? 'text-blue-900' : 'text-gray-900'}`}>
                    {type.label}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={config.dateRange.start}
                  onChange={(e) => setConfig({ ...config, dateRange: { ...config.dateRange, start: e.target.value } })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dateRange ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={config.dateRange.end}
                  onChange={(e) => setConfig({ ...config, dateRange: { ...config.dateRange, end: e.target.value } })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dateRange ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            {errors.dateRange && <p className="text-red-500 text-sm mt-1">{errors.dateRange}</p>}
          </div>

          {/* Movement Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Movement Types <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'receipt', label: 'Receipts', color: 'green' },
                { value: 'issue', label: 'Issues', color: 'red' },
                { value: 'transfer', label: 'Transfers', color: 'blue' },
                { value: 'adjustment', label: 'Adjustments', color: 'yellow' },
                { value: 'return', label: 'Returns', color: 'purple' }
              ].map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.movementTypes.includes(type.value)}
                    onChange={() => toggleMovementType(type.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            {errors.movementTypes && <p className="text-red-500 text-sm mt-1">{errors.movementTypes}</p>}
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'csv', label: 'CSV', icon: Database }
              ].map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.value}
                    onClick={() => setConfig({ ...config, format: format.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.format === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${config.format === format.value ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`font-medium text-center ${config.format === format.value ? 'text-blue-900' : 'text-gray-700'}`}>
                      {format.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Group By</label>
            <select
              value={config.groupBy || 'date'}
              onChange={(e) => setConfig({ ...config, groupBy: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="item">Item</option>
              <option value="location">Location</option>
              <option value="type">Movement Type</option>
            </select>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeCharts}
                onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include charts and graphs (Excel/PDF only)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MODAL 3: EXPORT VALUATION ====================

interface ExportValuationModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (config: ExportValuationConfig) => void
}

export function ExportValuationModal({ isOpen, onClose, onExport }: ExportValuationModalProps) {
  const [config, setConfig] = useState<ExportValuationConfig>({
    valuationDate: new Date().toISOString().split('T')[0],
    valuationMethod: 'FIFO',
    categories: [],
    warehouses: [],
    format: 'excel',
    includeDetails: true,
    includeSummary: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!config.valuationDate) {
      newErrors.valuationDate = 'Valuation date is required'
    }

    if (!config.includeDetails && !config.includeSummary) {
      newErrors.options = 'Select at least one option (details or summary)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleExport = async () => {
    if (validate()) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      onExport(config)
      setIsLoading(false)
      onClose()
    }
  }

  const toggleCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const toggleWarehouse = (warehouse: string) => {
    setConfig(prev => ({
      ...prev,
      warehouses: prev.warehouses.includes(warehouse)
        ? prev.warehouses.filter(w => w !== warehouse)
        : [...prev.warehouses, warehouse]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Export Stock Valuation</h2>
              <p className="text-sm text-purple-100">Generate inventory valuation report</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-purple-800 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Valuation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valuation Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={config.valuationDate}
              onChange={(e) => setConfig({ ...config, valuationDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.valuationDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.valuationDate && <p className="text-red-500 text-sm mt-1">{errors.valuationDate}</p>}
            <p className="text-sm text-gray-600 mt-1">Stock value will be calculated as of this date</p>
          </div>

          {/* Valuation Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Valuation Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'FIFO', label: 'FIFO', desc: 'First In First Out' },
                { value: 'LIFO', label: 'LIFO', desc: 'Last In First Out' },
                { value: 'Weighted Average', label: 'Weighted Avg', desc: 'Average Cost' },
                { value: 'All', label: 'All Methods', desc: 'Compare all' }
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setConfig({ ...config, valuationMethod: method.value as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.valuationMethod === method.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className={`font-medium ${config.valuationMethod === method.value ? 'text-purple-900' : 'text-gray-900'}`}>
                    {method.label}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{method.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Categories (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {['Raw Materials', 'Work in Progress', 'Finished Goods', 'Consumables', 'Spare Parts', 'Packaging'].map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
            {config.categories.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">All categories will be included</p>
            )}
          </div>

          {/* Warehouses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Warehouses (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {['WH-01', 'WH-02', 'WH-03'].map((warehouse) => (
                <label key={warehouse} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.warehouses.includes(warehouse)}
                    onChange={() => toggleWarehouse(warehouse)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{warehouse}</span>
                </label>
              ))}
            </div>
            {config.warehouses.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">All warehouses will be included</p>
            )}
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: 'With formulas' },
                { value: 'pdf', label: 'PDF', icon: FileText, desc: 'Print-ready' }
              ].map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.value}
                    onClick={() => setConfig({ ...config, format: format.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      config.format === format.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${config.format === format.value ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`font-medium text-center ${config.format === format.value ? 'text-purple-900' : 'text-gray-700'}`}>
                      {format.label}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">{format.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Report Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Include Sections</label>
            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeDetails}
                  onChange={(e) => setConfig({ ...config, includeDetails: e.target.checked })}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Detailed Item List</p>
                  <p className="text-sm text-gray-600">Item-by-item breakdown with quantities and values</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeSummary}
                  onChange={(e) => setConfig({ ...config, includeSummary: e.target.checked })}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Summary Report</p>
                  <p className="text-sm text-gray-600">Totals by category, warehouse, and valuation method</p>
                </div>
              </label>
            </div>
            {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
          </div>

          {/* Preview */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">Report Preview</p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• Valuation Date: {new Date(config.valuationDate).toLocaleDateString()}</li>
                  <li>• Method: {config.valuationMethod}</li>
                  <li>• Format: {config.format.toUpperCase()}</li>
                  {config.categories.length > 0 && <li>• Categories: {config.categories.length} selected</li>}
                  {config.warehouses.length > 0 && <li>• Warehouses: {config.warehouses.length} selected</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate Valuation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
