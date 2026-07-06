'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Eye,
  Edit,
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import {
  CreateWarehouseModal,
  ViewWarehouseDetailsModal,
  CreateZoneModal,
  WarehouseData,
  ZoneData
} from '@/components/inventory/InventoryWarehouseModals'
import {
  warehouseService,
  Warehouse as ServiceWarehouse,
  WarehouseStatus,
  WarehouseType,
  CapacityUtilization
} from '@/services/warehouse.service'
import { inventoryService } from '@/services/InventoryService'
import { exportToCsv } from '@/lib/export'

interface Warehouse {
  id: string
  warehouseId: string
  name: string
  location: string
  type: 'main' | 'regional' | 'factory' | 'distribution'
  capacity: number
  currentStockValue: number
  utilizationPercent: number
  manager: string
  status: 'active' | 'inactive' | 'maintenance'
  address: string
  contactNumber: string
  establishedDate: string
  totalItems: number
  city: string
}

const InventoryWarehousePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal states
  const [isCreateWarehouseOpen, setIsCreateWarehouseOpen] = useState(false)
  const [isViewWarehouseOpen, setIsViewWarehouseOpen] = useState(false)
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null)
  const [warehouseList, setWarehouseList] = useState<Warehouse[]>([])
  const [selectedWarehouseIdForZone, setSelectedWarehouseIdForZone] = useState<string>('')

  // Loading and data states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  // Fetch warehouses on mount
  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      setError(null)
      const [warehouseData, capacityData] = await Promise.all([
        warehouseService.getAllWarehouses(),
        warehouseService.getCapacityUtilization()
      ])

      // Create a map for quick capacity lookup
      const capacityMap = new Map<string, CapacityUtilization>()
      capacityData.forEach(cap => capacityMap.set(cap.warehouseId, cap))

      // Map service warehouses to page format
      const mappedWarehouses: Warehouse[] = warehouseData.map(wh => {
        const capacity = capacityMap.get(wh.id)
        const typeMapping: Record<string, 'main' | 'regional' | 'factory' | 'distribution'> = {
          [WarehouseType.FINISHED_GOODS]: 'main',
          [WarehouseType.RAW_MATERIAL]: 'factory',
          [WarehouseType.WIP]: 'factory',
          [WarehouseType.SPARE_PARTS]: 'distribution',
          [WarehouseType.GENERAL]: 'regional',
          [WarehouseType.COLD_STORAGE]: 'distribution',
        }
        const statusMapping: Record<string, 'active' | 'inactive' | 'maintenance'> = {
          [WarehouseStatus.ACTIVE]: 'active',
          [WarehouseStatus.INACTIVE]: 'inactive',
          [WarehouseStatus.MAINTENANCE]: 'maintenance',
        }

        return {
          id: wh.id,
          warehouseId: wh.code,
          name: wh.name,
          location: `${wh.address.street}, ${wh.address.city}`,
          type: typeMapping[wh.type] || 'regional',
          capacity: wh.totalCapacity,
          currentStockValue: Math.round(wh.usedCapacity * 100), // Placeholder value
          utilizationPercent: capacity ? Math.round(capacity.utilizationPercentage) : Math.round((wh.usedCapacity / wh.totalCapacity) * 100),
          manager: wh.managerName || wh.contactPerson || 'Unassigned',
          status: statusMapping[wh.status] || 'inactive',
          address: wh.address.street,
          contactNumber: wh.contactPhone || '',
          establishedDate: wh.createdAt.split('T')[0],
          totalItems: Math.round(wh.usedCapacity / 10), // Placeholder
          city: wh.address.city
        }
      })

      setWarehouses(mappedWarehouses)
    } catch (err) {
      console.error('Failed to fetch warehouses:', err)
      setError('Failed to load warehouses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalCapacity = warehouses.reduce((sum, wh) => sum + wh.capacity, 0)
  const activeWarehouses = warehouses.filter(wh => wh.status === 'active').length
  const totalStockValue = warehouses.reduce((sum, wh) => sum + wh.currentStockValue, 0)
  const usedCapacity = warehouses.reduce((sum, wh) => sum + (wh.capacity * wh.utilizationPercent / 100), 0)
  const avgUtilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0

  const stats = [
    {
      title: 'Total Warehouses',
      value: warehouses.length.toString(),
      change: '+2 new',
      icon: WarehouseIcon,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Locations',
      value: activeWarehouses.toString(),
      change: '+1 this month',
      icon: MapPin,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Capacity',
      value: `${(totalCapacity / 1000).toFixed(0)}K m³`,
      change: '+5.2% vs last year',
      icon: Package,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Utilization %',
      value: `${avgUtilization}%`,
      change: '+3.5% this month',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  const getTypeColor = (type: string) => {
    const colors = {
      main: 'bg-blue-100 text-blue-800',
      regional: 'bg-purple-100 text-purple-800',
      factory: 'bg-green-100 text-green-800',
      distribution: 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return 'text-red-600 font-bold'
    if (utilization >= 70) return 'text-yellow-600 font-semibold'
    return 'text-green-600 font-medium'
  }

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization > 90) return 'bg-red-100'
    if (utilization >= 70) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch =
      warehouse.warehouseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter
    const matchesType = typeFilter === 'all' || warehouse.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentWarehouses = filteredWarehouses.slice(startIndex, endIndex)

  const handleExport = () => {
    exportToCsv('warehouses', filteredWarehouses as unknown as Record<string, unknown>[])
  }

  // Convert Warehouse to WarehouseData
  const convertToWarehouseData = (warehouse: Warehouse): WarehouseData => {
    return {
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.name,
      warehouseCode: warehouse.warehouseId,
      warehouseType: warehouse.type === 'factory' ? 'production' : warehouse.type === 'regional' ? 'distribution' : warehouse.type,
      location: {
        address: warehouse.address,
        city: warehouse.city,
        state: '',
        zipCode: '',
        country: 'India'
      },
      contact: {
        managerName: warehouse.manager,
        phone: warehouse.contactNumber,
        email: `${warehouse.manager.toLowerCase().replace(' ', '.')}@company.com`
      },
      capacity: {
        totalArea: warehouse.capacity,
        usedArea: Math.round(warehouse.capacity * warehouse.utilizationPercent / 100),
        unit: 'sqft'
      },
      status: warehouse.status,
      zones: [],
      features: []
    }
  }

  // Handle warehouse creation
  const handleCreateWarehouse = async (data: WarehouseData) => {
    try {
      const typeMapping: Record<string, WarehouseType> = {
        'main': WarehouseType.FINISHED_GOODS,
        'production': WarehouseType.WIP,
        'distribution': WarehouseType.SPARE_PARTS,
        'regional': WarehouseType.GENERAL,
      }

      await warehouseService.createWarehouse({
        code: data.warehouseId,
        name: data.warehouseName,
        type: typeMapping[data.warehouseType] || WarehouseType.GENERAL,
        address: {
          street: data.location.address,
          city: data.location.city,
          state: data.location.state,
          country: data.location.country,
          postalCode: data.location.zipCode,
        },
        contactPerson: data.contact.managerName,
        contactPhone: data.contact.phone,
        contactEmail: data.contact.email,
        totalCapacity: data.capacity.totalArea,
        capacityUom: data.capacity.unit,
      })

      // Refresh the list after creating
      await fetchWarehouses()
      setIsCreateWarehouseOpen(false)
    } catch (err) {
      console.error('Failed to create warehouse:', err)
      // Could show a toast or error message here
    }
  }

  // Handle warehouse view
  const handleViewWarehouse = (warehouse: Warehouse) => {
    const warehouseData = convertToWarehouseData(warehouse)
    setSelectedWarehouse(warehouseData)
    setIsViewWarehouseOpen(true)
  }

  // Handle warehouse edit
  const handleEditWarehouse = async () => {
    if (!selectedWarehouse) return
    const matched = warehouses.find(w => w.warehouseId === selectedWarehouse.warehouseCode)
    if (!matched?.id) return
    try {
      const typeMapping: Record<string, WarehouseType> = {
        'main': WarehouseType.FINISHED_GOODS,
        'production': WarehouseType.WIP,
        'distribution': WarehouseType.SPARE_PARTS,
        'regional': WarehouseType.GENERAL,
      }
      await warehouseService.updateWarehouse(matched.id, {
        code: selectedWarehouse.warehouseCode,
        name: selectedWarehouse.warehouseName,
        type: typeMapping[selectedWarehouse.warehouseType] || WarehouseType.GENERAL,
        address: {
          street: selectedWarehouse.location?.address,
          city: selectedWarehouse.location?.city,
          state: selectedWarehouse.location?.state,
          country: selectedWarehouse.location?.country,
          postalCode: selectedWarehouse.location?.zipCode,
        } as ServiceWarehouse['address'],
        contactPerson: selectedWarehouse.contact?.managerName,
        contactPhone: selectedWarehouse.contact?.phone,
        contactEmail: selectedWarehouse.contact?.email,
        totalCapacity: selectedWarehouse.capacity?.totalArea,
        capacityUom: selectedWarehouse.capacity?.unit,
      })
      await fetchWarehouses()
      setIsViewWarehouseOpen(false)
    } catch (err) {
      console.error('Failed to update warehouse:', err)
    }
  }

  // Handle add zone from warehouse details
  const handleAddZoneFromWarehouse = () => {
    if (selectedWarehouse) {
      setSelectedWarehouseIdForZone(selectedWarehouse.warehouseId)
      setIsViewWarehouseOpen(false)
      setIsCreateZoneOpen(true)
    }
  }

  // Handle zone creation
  const handleCreateZone = async (data: ZoneData) => {
    const zoneCode = data?.zoneCode
    const zoneName = data?.zoneName
    if (!zoneCode && !zoneName) return
    try {
      await inventoryService.createStockLocation({
        locationCode: zoneCode ?? zoneName,
        locationName: zoneName ?? zoneCode,
        warehouseId: data?.warehouseId ?? selectedWarehouse?.warehouseId,
        locationType: 'storage',
        zone: zoneName ?? zoneCode,
        status: 'Active',
      })

      // Update local warehouse zones
      if (selectedWarehouse) {
        const updatedWarehouse = {
          ...selectedWarehouse,
          zones: [...selectedWarehouse.zones, data.zoneName]
        }
        setSelectedWarehouse(updatedWarehouse)
      }

      setIsCreateZoneOpen(false)
      setSelectedWarehouseIdForZone('')
      await fetchWarehouses()
    } catch (err) {
      console.error('Failed to create zone:', err)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchWarehouses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="w-full h-full space-y-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const gradientMap: { [key: string]: string } = {
              'from-blue-500 to-blue-600': 'from-blue-50 to-blue-100',
              'from-green-500 to-green-600': 'from-green-50 to-green-100',
              'from-purple-500 to-purple-600': 'from-purple-50 to-purple-100',
              'from-yellow-500 to-yellow-600': 'from-yellow-50 to-yellow-100',
              'from-orange-500 to-orange-600': 'from-orange-50 to-orange-100'
            }
            const borderMap: { [key: string]: string } = {
              'from-blue-500 to-blue-600': 'border-blue-200',
              'from-green-500 to-green-600': 'border-green-200',
              'from-purple-500 to-purple-600': 'border-purple-200',
              'from-yellow-500 to-yellow-600': 'border-yellow-200',
              'from-orange-500 to-orange-600': 'border-orange-200'
            }
            const textMap: { [key: string]: { title: string; value: string } } = {
              'from-blue-500 to-blue-600': { title: 'text-blue-600', value: 'text-blue-900' },
              'from-green-500 to-green-600': { title: 'text-green-600', value: 'text-green-900' },
              'from-purple-500 to-purple-600': { title: 'text-purple-600', value: 'text-purple-900' },
              'from-yellow-500 to-yellow-600': { title: 'text-yellow-600', value: 'text-yellow-900' },
              'from-orange-500 to-orange-600': { title: 'text-orange-600', value: 'text-orange-900' }
            }
            const iconMap: { [key: string]: string } = {
              'from-blue-500 to-blue-600': 'text-blue-600',
              'from-green-500 to-green-600': 'text-green-600',
              'from-purple-500 to-purple-600': 'text-purple-600',
              'from-yellow-500 to-yellow-600': 'text-yellow-600',
              'from-orange-500 to-orange-600': 'text-orange-600'
            }
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${gradientMap[stat.gradient]} rounded-lg p-3 border ${borderMap[stat.gradient]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textMap[stat.gradient].title}`}>{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${textMap[stat.gradient].value}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${iconMap[stat.gradient]}`} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setIsCreateWarehouseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Warehouse
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by warehouse ID, name, location, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="main">Main</option>
                <option value="regional">Regional</option>
                <option value="factory">Factory</option>
                <option value="distribution">Distribution</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Warehouse ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Capacity (m³)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock Value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Utilization %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentWarehouses.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewWarehouse(warehouse)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{warehouse.warehouseId}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                      <div className="text-sm text-gray-500">{warehouse.city}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-600">{warehouse.location}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(warehouse.type)}`}>
                        {warehouse.type.charAt(0).toUpperCase() + warehouse.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {warehouse.capacity.toLocaleString()} m³
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatCurrency(warehouse.currentStockValue)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getUtilizationBgColor(warehouse.utilizationPercent)}`}>
                        <span className={getUtilizationColor(warehouse.utilizationPercent)}>
                          {warehouse.utilizationPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{warehouse.manager}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(warehouse.status)}`}>
                        {warehouse.status.charAt(0).toUpperCase() + warehouse.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleViewWarehouse(warehouse)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          onClick={() => handleViewWarehouse(warehouse)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredWarehouses.length)} of {filteredWarehouses.length} warehouses
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateWarehouseModal
        isOpen={isCreateWarehouseOpen}
        onClose={() => setIsCreateWarehouseOpen(false)}
        onSubmit={handleCreateWarehouse}
      />

      <ViewWarehouseDetailsModal
        isOpen={isViewWarehouseOpen}
        onClose={() => setIsViewWarehouseOpen(false)}
        warehouse={selectedWarehouse}
        onEdit={handleEditWarehouse}
        onAddZone={handleAddZoneFromWarehouse}
      />

      <CreateZoneModal
        isOpen={isCreateZoneOpen}
        onClose={() => {
          setIsCreateZoneOpen(false)
          setSelectedWarehouseIdForZone('')
        }}
        onSubmit={handleCreateZone}
        warehouseId={selectedWarehouseIdForZone}
      />
    </div>
  )
}

export default InventoryWarehousePage
