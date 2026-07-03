'use client'

import { useState, useEffect } from 'react'
import { SupportHardwareAssetService } from '@/services/support.service'
import { Monitor, Laptop, Server, Printer, HardDrive, Cpu, AlertCircle, CheckCircle, Clock, MapPin, User, Calendar, DollarSign, Settings, Eye, Edit, Trash2, Filter, Search, Plus, TrendingUp, TrendingDown } from 'lucide-react'

interface HardwareAsset {
  id: string
  assetTag: string
  name: string
  category: 'Desktop' | 'Laptop' | 'Server' | 'Printer' | 'Network Device' | 'Storage' | 'Other'
  manufacturer: string
  model: string
  serialNumber: string
  status: 'Active' | 'In Use' | 'In Storage' | 'Under Maintenance' | 'Retired' | 'Disposed'
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  location: {
    building: string
    floor: string
    room: string
  }
  assignedTo: {
    name: string
    department: string
    email: string
  } | null
  purchase: {
    date: string
    cost: number
    vendor: string
    warrantyExpiry: string
  }
  specifications: {
    processor?: string
    ram?: string
    storage?: string
    os?: string
    other?: string
  }
  maintenance: {
    lastService: string
    nextService: string
    serviceCount: number
  }
  lifecycle: {
    age: string
    expectedLife: string
    remainingLife: string
    depreciation: number
  }
}

export default function HardwareAssets() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<HardwareAsset | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const seedHardwareAssets: HardwareAsset[] = [
    {
      id: '1',
      assetTag: 'HW-2024-001',
      name: 'Dell OptiPlex 7090',
      category: 'Desktop',
      manufacturer: 'Dell',
      model: 'OptiPlex 7090',
      serialNumber: 'SN-DL-7090-001',
      status: 'In Use',
      condition: 'Excellent',
      location: { building: 'Main Building', floor: '3rd Floor', room: 'Room 305' },
      assignedTo: { name: 'Sarah Johnson', department: 'IT', email: 'sarah.j@company.com' },
      purchase: { date: '2024-01-15', cost: 1200, vendor: 'Dell Direct', warrantyExpiry: '2027-01-15' },
      specifications: { processor: 'Intel i7-11700', ram: '16GB DDR4', storage: '512GB SSD', os: 'Windows 11 Pro' },
      maintenance: { lastService: '2024-09-15', nextService: '2025-03-15', serviceCount: 2 },
      lifecycle: { age: '10 months', expectedLife: '5 years', remainingLife: '4.2 years', depreciation: 15 }
    },
    {
      id: '2',
      assetTag: 'HW-2024-002',
      name: 'HP EliteBook 850 G8',
      category: 'Laptop',
      manufacturer: 'HP',
      model: 'EliteBook 850 G8',
      serialNumber: 'SN-HP-850-002',
      status: 'In Use',
      condition: 'Good',
      location: { building: 'Main Building', floor: '2nd Floor', room: 'Hot Desk Area' },
      assignedTo: { name: 'Michael Chen', department: 'Development', email: 'michael.c@company.com' },
      purchase: { date: '2023-06-20', cost: 1800, vendor: 'HP Enterprise', warrantyExpiry: '2026-06-20' },
      specifications: { processor: 'Intel i7-1185G7', ram: '32GB DDR4', storage: '1TB NVMe SSD', os: 'Windows 11 Pro' },
      maintenance: { lastService: '2024-08-10', nextService: '2025-02-10', serviceCount: 4 },
      lifecycle: { age: '1.4 years', expectedLife: '4 years', remainingLife: '2.6 years', depreciation: 35 }
    },
    {
      id: '3',
      assetTag: 'HW-2023-045',
      name: 'Dell PowerEdge R750',
      category: 'Server',
      manufacturer: 'Dell',
      model: 'PowerEdge R750',
      serialNumber: 'SN-DL-R750-045',
      status: 'Active',
      condition: 'Excellent',
      location: { building: 'Data Center', floor: 'Ground Floor', room: 'Server Room A' },
      assignedTo: null,
      purchase: { date: '2023-03-10', cost: 8500, vendor: 'Dell EMC', warrantyExpiry: '2028-03-10' },
      specifications: { processor: 'Dual Intel Xeon Gold 6330', ram: '128GB DDR4 ECC', storage: '4TB RAID 10', os: 'Ubuntu Server 22.04 LTS' },
      maintenance: { lastService: '2024-10-01', nextService: '2025-01-01', serviceCount: 6 },
      lifecycle: { age: '1.7 years', expectedLife: '7 years', remainingLife: '5.3 years', depreciation: 24 }
    },
    {
      id: '4',
      assetTag: 'HW-2022-089',
      name: 'HP LaserJet Enterprise M608',
      category: 'Printer',
      manufacturer: 'HP',
      model: 'LaserJet Enterprise M608',
      serialNumber: 'SN-HP-M608-089',
      status: 'Under Maintenance',
      condition: 'Fair',
      location: { building: 'Main Building', floor: '1st Floor', room: 'Print Room' },
      assignedTo: null,
      purchase: { date: '2022-08-15', cost: 1200, vendor: 'HP Supply', warrantyExpiry: '2025-08-15' },
      specifications: { other: 'Speed: 65ppm, Duplex, Network, 1200x1200 DPI' },
      maintenance: { lastService: '2024-10-15', nextService: '2024-11-15', serviceCount: 12 },
      lifecycle: { age: '2.2 years', expectedLife: '5 years', remainingLife: '2.8 years', depreciation: 44 }
    },
    {
      id: '5',
      assetTag: 'HW-2024-012',
      name: 'Cisco Catalyst 9300',
      category: 'Network Device',
      manufacturer: 'Cisco',
      model: 'Catalyst 9300-48P',
      serialNumber: 'SN-CS-9300-012',
      status: 'Active',
      condition: 'Excellent',
      location: { building: 'Data Center', floor: 'Ground Floor', room: 'Network Room' },
      assignedTo: null,
      purchase: { date: '2024-02-01', cost: 5500, vendor: 'Cisco Direct', warrantyExpiry: '2027-02-01' },
      specifications: { other: '48 x 1G PoE+ ports, 4 x 10G SFP+, Stackable, Layer 3' },
      maintenance: { lastService: '2024-09-01', nextService: '2025-03-01', serviceCount: 1 },
      lifecycle: { age: '9 months', expectedLife: '7 years', remainingLife: '6.3 years', depreciation: 11 }
    },
    {
      id: '6',
      assetTag: 'HW-2023-078',
      name: 'Synology DS1821+',
      category: 'Storage',
      manufacturer: 'Synology',
      model: 'DiskStation DS1821+',
      serialNumber: 'SN-SY-1821-078',
      status: 'Active',
      condition: 'Good',
      location: { building: 'Data Center', floor: 'Ground Floor', room: 'Server Room B' },
      assignedTo: null,
      purchase: { date: '2023-09-20', cost: 3200, vendor: 'Synology Partner', warrantyExpiry: '2026-09-20' },
      specifications: { processor: 'AMD Ryzen V1500B', ram: '32GB DDR4 ECC', storage: '64TB (8x8TB)', os: 'DSM 7.2' },
      maintenance: { lastService: '2024-09-20', nextService: '2025-03-20', serviceCount: 4 },
      lifecycle: { age: '1.1 years', expectedLife: '6 years', remainingLife: '4.9 years', depreciation: 18 }
    },
    {
      id: '7',
      assetTag: 'HW-2021-156',
      name: 'Lenovo ThinkPad X1 Carbon',
      category: 'Laptop',
      manufacturer: 'Lenovo',
      model: 'ThinkPad X1 Carbon Gen 9',
      serialNumber: 'SN-LN-X1C9-156',
      status: 'In Storage',
      condition: 'Good',
      location: { building: 'Main Building', floor: 'Basement', room: 'IT Storage' },
      assignedTo: null,
      purchase: { date: '2021-11-10', cost: 2100, vendor: 'Lenovo Business', warrantyExpiry: '2024-11-10' },
      specifications: { processor: 'Intel i7-1165G7', ram: '16GB LPDDR4X', storage: '512GB PCIe SSD', os: 'Windows 11 Pro' },
      maintenance: { lastService: '2024-05-10', nextService: '2024-11-10', serviceCount: 8 },
      lifecycle: { age: '3 years', expectedLife: '4 years', remainingLife: '1 year', depreciation: 75 }
    },
    {
      id: '8',
      assetTag: 'HW-2020-234',
      name: 'HP ProDesk 600 G5',
      category: 'Desktop',
      manufacturer: 'HP',
      model: 'ProDesk 600 G5',
      serialNumber: 'SN-HP-600-234',
      status: 'Retired',
      condition: 'Poor',
      location: { building: 'Warehouse', floor: 'Ground Floor', room: 'Disposal Area' },
      assignedTo: null,
      purchase: { date: '2020-03-15', cost: 900, vendor: 'HP Supply', warrantyExpiry: '2023-03-15' },
      specifications: { processor: 'Intel i5-9500', ram: '8GB DDR4', storage: '256GB SSD', os: 'Windows 10 Pro' },
      maintenance: { lastService: '2023-08-15', nextService: 'N/A', serviceCount: 15 },
      lifecycle: { age: '4.6 years', expectedLife: '5 years', remainingLife: '0 years', depreciation: 100 }
    }
  ]

  const [hardwareAssets, setHardwareAssets] = useState<HardwareAsset[]>(seedHardwareAssets)

  useEffect(() => {
    let cancelled = false
    SupportHardwareAssetService.getAssets()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setHardwareAssets(rows as unknown as HardwareAsset[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const stats = {
    totalAssets: hardwareAssets.length,
    inUse: hardwareAssets.filter(a => a.status === 'In Use').length,
    active: hardwareAssets.filter(a => a.status === 'Active').length,
    maintenance: hardwareAssets.filter(a => a.status === 'Under Maintenance').length,
    totalValue: hardwareAssets.reduce((sum, a) => sum + a.purchase.cost, 0),
    avgAge: '1.8 years'
  }

  const categoryIcons = {
    Desktop: Monitor,
    Laptop: Laptop,
    Server: Server,
    Printer: Printer,
    'Network Device': Cpu,
    Storage: HardDrive,
    Other: Settings
  }

  const filteredAssets = hardwareAssets.filter(asset => {
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || asset.status === selectedStatus
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-700'
      case 'In Use': return 'bg-green-100 text-green-700'
      case 'In Storage': return 'bg-gray-100 text-gray-700'
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-700'
      case 'Retired': return 'bg-orange-100 text-orange-700'
      case 'Disposed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'text-green-600'
      case 'Good': return 'text-blue-600'
      case 'Fair': return 'text-yellow-600'
      case 'Poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hardware Assets</h1>
          <p className="text-gray-600 mt-1">Manage and track hardware inventory</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Add Asset
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold mt-1">{stats.totalAssets}</p>
            </div>
            <Monitor className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Use</p>
              <p className="text-2xl font-bold mt-1">{stats.inUse}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
            </div>
            <Server className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold mt-1">{stats.maintenance}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold mt-1">${(stats.totalValue / 1000).toFixed(1)}k</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Age</p>
              <p className="text-2xl font-bold mt-1">{stats.avgAge}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, asset tag, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Desktop">Desktop</option>
            <option value="Laptop">Laptop</option>
            <option value="Server">Server</option>
            <option value="Printer">Printer</option>
            <option value="Network Device">Network Device</option>
            <option value="Storage">Storage</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="In Use">In Use</option>
            <option value="In Storage">In Storage</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Asset</th>
                <th className="text-left p-3 font-medium text-gray-600">Category</th>
                <th className="text-left p-3 font-medium text-gray-600">Status</th>
                <th className="text-left p-3 font-medium text-gray-600">Condition</th>
                <th className="text-left p-3 font-medium text-gray-600">Assigned To</th>
                <th className="text-left p-3 font-medium text-gray-600">Location</th>
                <th className="text-left p-3 font-medium text-gray-600">Value</th>
                <th className="text-left p-3 font-medium text-gray-600">Age</th>
                <th className="text-left p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAssets.map((asset) => {
                const Icon = categoryIcons[asset.category]
                return (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-gray-600">{asset.assetTag}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{asset.category}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="p-4">
                      {asset.assignedTo ? (
                        <div>
                          <p className="text-sm font-medium">{asset.assignedTo.name}</p>
                          <p className="text-xs text-gray-600">{asset.assignedTo.department}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm">{asset.location.building}</p>
                          <p className="text-xs text-gray-600">{asset.location.room}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">${asset.purchase.cost.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{asset.lifecycle.depreciation}% deprec.</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{asset.lifecycle.age}</p>
                      <p className="text-xs text-gray-600">{asset.lifecycle.remainingLife} left</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset)
                            setShowDetailModal(true)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                          <Edit className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = categoryIcons[selectedAsset.category]
                  return (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-xl font-semibold">{selectedAsset.name}</h2>
                  <p className="text-sm text-gray-600">{selectedAsset.assetTag}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{selectedAsset.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Manufacturer</p>
                    <p className="font-medium">{selectedAsset.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-medium">{selectedAsset.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Serial Number</p>
                    <p className="font-medium">{selectedAsset.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                      {selectedAsset.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Condition</p>
                    <p className={`font-medium ${getConditionColor(selectedAsset.condition)}`}>{selectedAsset.condition}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAsset.specifications.processor && (
                    <div>
                      <p className="text-sm text-gray-600">Processor</p>
                      <p className="font-medium">{selectedAsset.specifications.processor}</p>
                    </div>
                  )}
                  {selectedAsset.specifications.ram && (
                    <div>
                      <p className="text-sm text-gray-600">RAM</p>
                      <p className="font-medium">{selectedAsset.specifications.ram}</p>
                    </div>
                  )}
                  {selectedAsset.specifications.storage && (
                    <div>
                      <p className="text-sm text-gray-600">Storage</p>
                      <p className="font-medium">{selectedAsset.specifications.storage}</p>
                    </div>
                  )}
                  {selectedAsset.specifications.os && (
                    <div>
                      <p className="text-sm text-gray-600">Operating System</p>
                      <p className="font-medium">{selectedAsset.specifications.os}</p>
                    </div>
                  )}
                  {selectedAsset.specifications.other && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Other Specifications</p>
                      <p className="font-medium">{selectedAsset.specifications.other}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Assignment */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Location & Assignment</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Building</p>
                    <p className="font-medium">{selectedAsset.location.building}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Floor</p>
                    <p className="font-medium">{selectedAsset.location.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room</p>
                    <p className="font-medium">{selectedAsset.location.room}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    {selectedAsset.assignedTo ? (
                      <div>
                        <p className="font-medium">{selectedAsset.assignedTo.name}</p>
                        <p className="text-sm text-gray-600">{selectedAsset.assignedTo.department}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Unassigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase & Financial */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Purchase & Financial</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Purchase Date</p>
                    <p className="font-medium">{selectedAsset.purchase.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Purchase Cost</p>
                    <p className="font-medium">${selectedAsset.purchase.cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vendor</p>
                    <p className="font-medium">{selectedAsset.purchase.vendor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Warranty Expiry</p>
                    <p className="font-medium">{selectedAsset.purchase.warrantyExpiry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Depreciation</p>
                    <p className="font-medium">{selectedAsset.lifecycle.depreciation}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="font-medium">
                      ${Math.round(selectedAsset.purchase.cost * (1 - selectedAsset.lifecycle.depreciation / 100)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Maintenance History</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Last Service</p>
                    <p className="font-medium">{selectedAsset.maintenance.lastService}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Service</p>
                    <p className="font-medium">{selectedAsset.maintenance.nextService}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Count</p>
                    <p className="font-medium">{selectedAsset.maintenance.serviceCount} times</p>
                  </div>
                </div>
              </div>

              {/* Lifecycle */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Asset Lifecycle</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{selectedAsset.lifecycle.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Life</p>
                    <p className="font-medium">{selectedAsset.lifecycle.expectedLife}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining Life</p>
                    <p className="font-medium">{selectedAsset.lifecycle.remainingLife}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Asset
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Schedule Maintenance
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                  Retire Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
