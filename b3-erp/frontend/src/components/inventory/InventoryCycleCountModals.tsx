"use client"

import React, { useState } from 'react'
import { X, Plus, Trash2, Calendar, ClipboardList, CheckCircle, AlertCircle, Play, Pause, FileText, Download, TrendingUp } from 'lucide-react'
import { inventoryService } from '@/services/InventoryService'

// ==================== INTERFACES ====================

export interface CycleCountItem {
  itemId: string
  itemCode: string
  itemName: string
  category: string
  location: string
  zone: string
  bin: string
  expectedQuantity: number
  countedQuantity: number
  variance: number
  variancePercentage: number
  status: 'pending' | 'counted' | 'verified' | 'discrepancy'
  countedBy?: string
  countedDate?: string
  notes?: string
}

export interface CycleCountSchedule {
  scheduleId: string
  scheduleName: string
  warehouse: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  countType: 'abc-class' | 'location' | 'random' | 'high-value'
  startDate: string
  nextCountDate: string
  assignedTo: string
  zones: string[]
  itemCategories: string[]
  status: 'active' | 'paused' | 'completed'
}

export interface CycleCountSession {
  sessionId: string
  sessionName: string
  warehouse: string
  zones: string[]
  countDate: string
  assignedTo: string
  items: CycleCountItem[]
  status: 'draft' | 'in-progress' | 'completed' | 'verified'
  progress: number
  totalItems: number
  countedItems: number
  discrepancies: number
  startTime?: string
  endTime?: string
  notes?: string
}

export interface CycleCountVarianceAnalysis {
  sessionId: string
  totalVariance: number
  variancePercentage: number
  itemsWithVariance: number
  highVarianceItems: CycleCountItem[]
  varianceByCategory: { category: string; variance: number; count: number }[]
  varianceByZone: { zone: string; variance: number; count: number }[]
  recommendedActions: string[]
}

// ==================== CREATE CYCLE COUNT SCHEDULE MODAL ====================

interface CreateScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CycleCountSchedule) => void
}

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CycleCountSchedule>({
    scheduleId: `SCH-${Date.now()}`,
    scheduleName: '',
    warehouse: '',
    frequency: 'weekly',
    countType: 'abc-class',
    startDate: new Date().toISOString().split('T')[0],
    nextCountDate: '',
    assignedTo: '',
    zones: [],
    itemCategories: [],
    status: 'active'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const addZone = () => {
    if (selectedZone && !formData.zones.includes(selectedZone)) {
      setFormData({ ...formData, zones: [...formData.zones, selectedZone] })
      setSelectedZone('')
    }
  }

  const removeZone = (zone: string) => {
    setFormData({ ...formData, zones: formData.zones.filter(z => z !== zone) })
  }

  const addCategory = () => {
    if (selectedCategory && !formData.itemCategories.includes(selectedCategory)) {
      setFormData({ ...formData, itemCategories: [...formData.itemCategories, selectedCategory] })
      setSelectedCategory('')
    }
  }

  const removeCategory = (category: string) => {
    setFormData({ ...formData, itemCategories: formData.itemCategories.filter(c => c !== category) })
  }

  const calculateNextCountDate = (startDate: string, frequency: string) => {
    const start = new Date(startDate)
    let next = new Date(start)

    switch (frequency) {
      case 'daily':
        next.setDate(start.getDate() + 1)
        break
      case 'weekly':
        next.setDate(start.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(start.getMonth() + 1)
        break
      case 'quarterly':
        next.setMonth(start.getMonth() + 3)
        break
    }

    return next.toISOString().split('T')[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.scheduleName) newErrors.scheduleName = 'Schedule name is required'
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required'
    if (!formData.assignedTo) newErrors.assignedTo = 'Assignee is required'
    if (formData.zones.length === 0) newErrors.zones = 'Add at least one zone'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const nextCountDate = calculateNextCountDate(formData.startDate, formData.frequency)
    onSubmit({ ...formData, nextCountDate })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Create Cycle Count Schedule</h2>
              <p className="text-sm opacity-90">Automate regular inventory counting</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Name *
              </label>
              <input
                type="text"
                value={formData.scheduleName}
                onChange={(e) => setFormData({ ...formData, scheduleName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.scheduleName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Weekly A-Class Count"
              />
              {errors.scheduleName && <p className="text-red-500 text-xs mt-1">{errors.scheduleName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse *
              </label>
              <select
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.warehouse ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Warehouse</option>
                <option value="WH-001">Main Warehouse</option>
                <option value="WH-002">Production Warehouse</option>
                <option value="WH-003">Finished Goods</option>
              </select>
              {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select User</option>
                <option value="user-1">John Doe</option>
                <option value="user-2">Jane Smith</option>
                <option value="user-3">Mike Johnson</option>
              </select>
              {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count Type *
              </label>
              <select
                value={formData.countType}
                onChange={(e) => setFormData({ ...formData, countType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="abc-class">ABC Class Analysis</option>
                <option value="location">Location-based</option>
                <option value="random">Random Sampling</option>
                <option value="high-value">High-Value Items</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Zones */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zones to Count *
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Zone</option>
                <option value="Zone-A">Zone A</option>
                <option value="Zone-B">Zone B</option>
                <option value="Zone-C">Zone C</option>
                <option value="Zone-D">Zone D</option>
              </select>
              <button
                type="button"
                onClick={addZone}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.zones.map((zone) => (
                <span
                  key={zone}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {zone}
                  <button
                    type="button"
                    onClick={() => removeZone(zone)}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {errors.zones && <p className="text-red-500 text-xs mt-1">{errors.zones}</p>}
          </div>

          {/* Item Categories */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Categories (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Work in Progress">Work in Progress</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Spare Parts">Spare Parts</option>
              </select>
              <button
                type="button"
                onClick={addCategory}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.itemCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Schedule Information</p>
                <p className="text-sm text-blue-700">
                  This schedule will generate cycle count sessions automatically based on the frequency selected.
                  Next count will be scheduled for {calculateNextCountDate(formData.startDate, formData.frequency)}.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Create Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== START CYCLE COUNT SESSION MODAL ====================

interface StartSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CycleCountSession) => void
  scheduleId?: string
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scheduleId
}) => {
  const [formData, setFormData] = useState<CycleCountSession>({
    sessionId: `CC-${Date.now()}`,
    sessionName: '',
    warehouse: '',
    zones: [],
    countDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    items: [],
    status: 'draft',
    progress: 0,
    totalItems: 0,
    countedItems: 0,
    discrepancies: 0,
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedZone, setSelectedZone] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const addZone = () => {
    if (selectedZone && !formData.zones.includes(selectedZone)) {
      setFormData({ ...formData, zones: [...formData.zones, selectedZone] })
      setSelectedZone('')
    }
  }

  const removeZone = (zone: string) => {
    setFormData({ ...formData, zones: formData.zones.filter(z => z !== zone) })
  }

  // Build the count list from the warehouse's real stock balances (expected = system on-hand).
  const generateItems = async () => {
    if (!formData.warehouse) {
      setGenerateError('Select a warehouse first')
      return
    }
    setIsGenerating(true)
    setGenerateError(null)
    try {
      const balances = await inventoryService.getStockBalances({ warehouseId: formData.warehouse })
      const items: CycleCountItem[] = (balances || []).map((b, index) => ({
        itemId: String(b.itemId ?? b.id ?? index + 1),
        itemCode: b.itemCode ?? '',
        itemName: b.itemName ?? '',
        category: (b as any).category ?? (b as any).categoryName ?? 'Uncategorized',
        location: b.locationName ?? b.warehouseName ?? formData.warehouse,
        zone: (b as any).zone ?? formData.zones[0] ?? '',
        bin: (b as any).bin ?? b.locationName ?? '-',
        expectedQuantity: Number(b.availableQuantity ?? 0),
        countedQuantity: 0,
        variance: 0,
        variancePercentage: 0,
        status: 'pending'
      }))
      setFormData(prev => ({ ...prev, items, totalItems: items.length }))
      if (items.length === 0) {
        setGenerateError('No stock found for the selected warehouse')
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate count list')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.sessionName) newErrors.sessionName = 'Session name is required'
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required'
    if (!formData.assignedTo) newErrors.assignedTo = 'Assignee is required'
    if (formData.zones.length === 0) newErrors.zones = 'Add at least one zone'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Play className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Start Cycle Count Session</h2>
              <p className="text-sm opacity-90">{formData.sessionId}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Name *
              </label>
              <input
                type="text"
                value={formData.sessionName}
                onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sessionName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Zone A Count - Jan 2025"
              />
              {errors.sessionName && <p className="text-red-500 text-xs mt-1">{errors.sessionName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse *
              </label>
              <select
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.warehouse ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Warehouse</option>
                <option value="WH-001">Main Warehouse</option>
                <option value="WH-002">Production Warehouse</option>
              </select>
              {errors.warehouse && <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count Date *
              </label>
              <input
                type="date"
                value={formData.countDate}
                onChange={(e) => setFormData({ ...formData, countDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select User</option>
                <option value="user-1">John Doe</option>
                <option value="user-2">Jane Smith</option>
              </select>
              {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
            </div>
          </div>

          {/* Zones */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zones to Count *
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Zone</option>
                <option value="Zone-A">Zone A</option>
                <option value="Zone-B">Zone B</option>
                <option value="Zone-C">Zone C</option>
              </select>
              <button
                type="button"
                onClick={addZone}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.zones.map((zone) => (
                <span
                  key={zone}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {zone}
                  <button
                    type="button"
                    onClick={() => removeZone(zone)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {errors.zones && <p className="text-red-500 text-xs mt-1">{errors.zones}</p>}
          </div>

          {/* Generate Items */}
          <div className="mb-3">
            <button
              type="button"
              onClick={generateItems}
              disabled={formData.zones.length === 0 || !formData.warehouse || isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-5 h-5" />
              {isGenerating ? 'Generating…' : `Generate Count List (${formData.totalItems} items)`}
            </button>
            {generateError ? (
              <p className="text-sm text-red-500 mt-2 text-center">{generateError}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-2 text-center">
                This will pull the selected warehouse&apos;s on-hand stock as the count list
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special instructions or notes..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== PERFORM COUNT MODAL ====================

interface PerformCountModalProps {
  isOpen: boolean
  onClose: () => void
  session: CycleCountSession | null
  onUpdateCount: (itemId: string, countedQuantity: number, notes?: string) => void
}

export const PerformCountModal: React.FC<PerformCountModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateCount
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countedQuantity, setCountedQuantity] = useState(0)
  const [itemNotes, setItemNotes] = useState('')

  if (!isOpen || !session || session.items.length === 0) return null

  const currentItem = session.items[currentIndex]
  const hasNext = currentIndex < session.items.length - 1
  const hasPrevious = currentIndex > 0

  const handleSaveAndNext = () => {
    onUpdateCount(currentItem.itemId, countedQuantity, itemNotes)

    if (hasNext) {
      setCurrentIndex(currentIndex + 1)
      setCountedQuantity(0)
      setItemNotes('')
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1)
      const prevItem = session.items[currentIndex - 1]
      setCountedQuantity(prevItem.countedQuantity)
      setItemNotes(prevItem.notes || '')
    }
  }

  const variance = countedQuantity - currentItem.expectedQuantity
  const variancePercentage = currentItem.expectedQuantity > 0
    ? (variance / currentItem.expectedQuantity) * 100
    : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Perform Count</h2>
              <p className="text-sm opacity-90">
                Item {currentIndex + 1} of {session.items.length}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / session.items.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-600">Item Code</p>
                <p className="text-lg font-bold text-gray-800">{currentItem.itemCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Item Name</p>
                <p className="text-lg font-bold text-gray-800">{currentItem.itemName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold text-gray-700">
                  {currentItem.zone} - {currentItem.bin}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Quantity</p>
                <p className="text-lg font-bold text-blue-600">{currentItem.expectedQuantity}</p>
              </div>
            </div>
          </div>

          {/* Count Input */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Counted Quantity *
            </label>
            <input
              type="number"
              value={countedQuantity}
              onChange={(e) => setCountedQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-2xl font-bold text-center"
              placeholder="Enter counted quantity"
              autoFocus
            />
          </div>

          {/* Variance Display */}
          {countedQuantity > 0 && (
            <div className={`p-4 rounded-lg mb-3 ${
              Math.abs(variancePercentage) > 5
                ? 'bg-red-50 border border-red-200'
                : variance !== 0
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Variance</p>
                  <p className={`text-2xl font-bold ${
                    variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {variance > 0 ? '+' : ''}{variance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Variance %</p>
                  <p className={`text-2xl font-bold ${
                    Math.abs(variancePercentage) > 5 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {variancePercentage > 0 ? '+' : ''}{variancePercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
              {Math.abs(variancePercentage) > 5 && (
                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    <strong>High variance detected!</strong> Please recount and add notes explaining the discrepancy.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes {Math.abs(variancePercentage) > 5 && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Add notes about this count (required for high variance)..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between rounded-b-lg">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Save & Exit
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={countedQuantity === 0 || (Math.abs(variancePercentage) > 5 && !itemNotes)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasNext ? 'Save & Next' : 'Save & Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VIEW SESSION DETAILS MODAL ====================

interface ViewSessionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  session: CycleCountSession | null
  onComplete?: () => void
  onViewVariance?: () => void
}

export const ViewSessionDetailsModal: React.FC<ViewSessionDetailsModalProps> = ({
  isOpen,
  onClose,
  session,
  onComplete,
  onViewVariance
}) => {
  if (!isOpen || !session) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'in-progress': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'verified': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700'
      case 'counted': return 'bg-blue-100 text-blue-700'
      case 'verified': return 'bg-green-100 text-green-700'
      case 'discrepancy': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Cycle Count Session Details</h2>
              <p className="text-sm opacity-90">{session.sessionId} - {session.sessionName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)}`}>
                {session.status.toUpperCase()}
              </span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-700">{session.totalItems}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600 font-medium">Counted</p>
              <p className="text-2xl font-bold text-green-700">{session.countedItems}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-600 font-medium">Discrepancies</p>
              <p className="text-2xl font-bold text-yellow-700">{session.discrepancies}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-600 font-medium">Progress</p>
              <p className="text-2xl font-bold text-purple-700">{session.progress}%</p>
            </div>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Warehouse</p>
              <p className="text-lg font-semibold text-gray-800">{session.warehouse}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Count Date</p>
              <p className="text-lg font-semibold text-gray-800">{session.countDate}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Assigned To</p>
              <p className="text-lg font-semibold text-gray-800">{session.assignedTo}</p>
            </div>
          </div>

          {/* Zones */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Zones</label>
            <div className="flex flex-wrap gap-2">
              {session.zones.map((zone) => (
                <span
                  key={zone}
                  className="inline-flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {zone}
                </span>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-700 mb-3">Count Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Location</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Expected</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Counted</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Variance</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {session.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.zone}-{item.bin}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.expectedQuantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.countedQuantity}</td>
                      <td className={`border border-gray-300 px-3 py-2 text-sm text-right font-semibold ${
                        item.variance > 0 ? 'text-green-600' : item.variance < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {item.variance > 0 ? '+' : ''}{item.variance}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getItemStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-gray-700">{session.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            {onViewVariance && session.discrepancies > 0 && (
              <button
                onClick={onViewVariance}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                View Variance Analysis
              </button>
            )}
            {onComplete && session.status === 'in-progress' && (
              <button
                onClick={onComplete}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VARIANCE ANALYSIS MODAL ====================

interface VarianceAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  analysis: CycleCountVarianceAnalysis | null
}

export const VarianceAnalysisModal: React.FC<VarianceAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis
}) => {
  if (!isOpen || !analysis) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Variance Analysis</h2>
              <p className="text-sm opacity-90">Session {analysis.sessionId}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 font-medium">Total Variance</p>
              <p className="text-3xl font-bold text-red-700">{analysis.totalVariance}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-600 font-medium">Variance %</p>
              <p className="text-3xl font-bold text-orange-700">{analysis.variancePercentage.toFixed(2)}%</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-600 font-medium">Items with Variance</p>
              <p className="text-3xl font-bold text-yellow-700">{analysis.itemsWithVariance}</p>
            </div>
          </div>

          {/* High Variance Items */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-700 mb-3">High Variance Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Expected</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Counted</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Variance</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Variance %</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.highVarianceItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.itemName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.expectedQuantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.countedQuantity}</td>
                      <td className={`border border-gray-300 px-3 py-2 text-sm text-right font-semibold ${
                        item.variance > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.variance > 0 ? '+' : ''}{item.variance}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right font-semibold text-red-600">
                        {item.variancePercentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Variance by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Variance by Category</h3>
              <div className="space-y-2">
                {analysis.varianceByCategory.map((cat, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="text-sm text-gray-600">{cat.count} items</span>
                    </div>
                    <div className="text-lg font-bold text-red-600">{cat.variance > 0 ? '+' : ''}{cat.variance}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Variance by Zone</h3>
              <div className="space-y-2">
                {analysis.varianceByZone.map((zone, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700">{zone.zone}</span>
                      <span className="text-sm text-gray-600">{zone.count} items</span>
                    </div>
                    <div className="text-lg font-bold text-red-600">{zone.variance > 0 ? '+' : ''}{zone.variance}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Recommended Actions</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <ul className="space-y-2">
                {analysis.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-3 py-2 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
