'use client'

import { useState, useEffect } from 'react'
import { MapPin, Package, User, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, Building, Truck, Archive, Eye, Filter, Search, Plus, History } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service';

interface AssetMovement {
  id: string
  assetId: string
  assetName: string
  assetType: 'Hardware' | 'Software' | 'Equipment'
  assetTag: string
  movementType: 'Transfer' | 'Assignment' | 'Return' | 'Maintenance' | 'Storage' | 'Disposal'
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled'
  from: {
    location: string
    building: string
    room: string
    person?: string
  }
  to: {
    location: string
    building: string
    room: string
    person?: string
  }
  requestedBy: {
    name: string
    department: string
    email: string
  }
  dates: {
    requested: string
    scheduled: string
    completed?: string
  }
  notes: string
  tracking: {
    currentLocation: string
    lastUpdate: string
    estimatedArrival?: string
  }
}

export default function AssetTracking() {
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMovement, setSelectedMovement] = useState<AssetMovement | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [assetMovements, setAssetMovements] = useState<AssetMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = (await supportPagesService.getHardwareAssets()) as any[]
        const mapped: AssetMovement[] = (Array.isArray(raw) ? raw : []).map((a: any) => ({
          id: String(a.id ?? a.assetId ?? a.assetTag ?? ''),
          assetId: String(a.assetId ?? a.id ?? a.assetTag ?? ''),
          assetName: String(a.assetName ?? a.name ?? a.model ?? ''),
          assetType: (a.assetType ?? 'Hardware') as AssetMovement['assetType'],
          assetTag: String(a.assetTag ?? a.tag ?? a.assetId ?? a.id ?? ''),
          movementType: (a.movementType ?? 'Transfer') as AssetMovement['movementType'],
          status: (a.status ?? 'Pending') as AssetMovement['status'],
          from: {
            location: String(a.from?.location ?? a.fromLocation ?? ''),
            building: String(a.from?.building ?? a.fromBuilding ?? ''),
            room: String(a.from?.room ?? a.fromRoom ?? ''),
            person: a.from?.person ?? a.fromPerson ?? undefined,
          },
          to: {
            location: String(a.to?.location ?? a.toLocation ?? a.location ?? ''),
            building: String(a.to?.building ?? a.toBuilding ?? a.building ?? ''),
            room: String(a.to?.room ?? a.toRoom ?? a.room ?? ''),
            person: a.to?.person ?? a.toPerson ?? a.assignedTo ?? undefined,
          },
          requestedBy: {
            name: String(a.requestedBy?.name ?? a.requestedByName ?? a.owner ?? ''),
            department: String(a.requestedBy?.department ?? a.department ?? ''),
            email: String(a.requestedBy?.email ?? a.requestedByEmail ?? ''),
          },
          dates: {
            requested: String(a.dates?.requested ?? a.requestedDate ?? a.createdAt ?? ''),
            scheduled: String(a.dates?.scheduled ?? a.scheduledDate ?? ''),
            completed: a.dates?.completed ?? a.completedDate ?? undefined,
          },
          notes: String(a.notes ?? a.description ?? ''),
          tracking: {
            currentLocation: String(a.tracking?.currentLocation ?? a.currentLocation ?? a.location ?? ''),
            lastUpdate: String(a.tracking?.lastUpdate ?? a.lastUpdate ?? a.updatedAt ?? ''),
            estimatedArrival: a.tracking?.estimatedArrival ?? a.estimatedArrival ?? undefined,
          },
        }))
        if (!cancelled) setAssetMovements(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load asset movements')
          setAssetMovements([])
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

  const assetMovementsSeed: AssetMovement[] = [
    {
      id: '1',
      assetId: 'HW-2024-001',
      assetName: 'Dell OptiPlex 7090',
      assetType: 'Hardware',
      assetTag: 'HW-2024-001',
      movementType: 'Transfer',
      status: 'In Transit',
      from: {
        location: 'Main Building - 3rd Floor',
        building: 'Main Building',
        room: 'Room 305',
        person: 'Sarah Johnson'
      },
      to: {
        location: 'Main Building - 2nd Floor',
        building: 'Main Building',
        room: 'Room 205',
        person: 'Michael Chen'
      },
      requestedBy: {
        name: 'IT Admin',
        department: 'IT Department',
        email: 'it.admin@company.com'
      },
      dates: {
        requested: '2024-10-20',
        scheduled: '2024-10-21'
      },
      notes: 'Transfer to new employee desk',
      tracking: {
        currentLocation: 'In transit from 3rd Floor to 2nd Floor',
        lastUpdate: '2024-10-21 10:30 AM',
        estimatedArrival: '2024-10-21 2:00 PM'
      }
    },
    {
      id: '2',
      assetId: 'HW-2024-002',
      assetName: 'HP EliteBook 850 G8',
      assetType: 'Hardware',
      assetTag: 'HW-2024-002',
      movementType: 'Assignment',
      status: 'Completed',
      from: {
        location: 'IT Storage',
        building: 'Main Building',
        room: 'IT Storage Room'
      },
      to: {
        location: 'Main Building - 4th Floor',
        building: 'Main Building',
        room: 'Room 405',
        person: 'Emily Davis'
      },
      requestedBy: {
        name: 'HR Manager',
        department: 'Human Resources',
        email: 'hr@company.com'
      },
      dates: {
        requested: '2024-10-18',
        scheduled: '2024-10-19',
        completed: '2024-10-19'
      },
      notes: 'New hire laptop assignment',
      tracking: {
        currentLocation: 'Assigned to Emily Davis - Room 405',
        lastUpdate: '2024-10-19 3:45 PM'
      }
    },
    {
      id: '3',
      assetId: 'HW-2022-089',
      assetName: 'HP LaserJet Enterprise M608',
      assetType: 'Hardware',
      assetTag: 'HW-2022-089',
      movementType: 'Maintenance',
      status: 'In Transit',
      from: {
        location: 'Main Building - Print Room',
        building: 'Main Building',
        room: 'Print Room'
      },
      to: {
        location: 'Service Center',
        building: 'External',
        room: 'HP Service Center'
      },
      requestedBy: {
        name: 'Facilities Manager',
        department: 'Facilities',
        email: 'facilities@company.com'
      },
      dates: {
        requested: '2024-10-15',
        scheduled: '2024-10-20'
      },
      notes: 'Scheduled maintenance for paper jam issue',
      tracking: {
        currentLocation: 'Out for maintenance at HP Service Center',
        lastUpdate: '2024-10-20 9:00 AM',
        estimatedArrival: '2024-10-25'
      }
    },
    {
      id: '4',
      assetId: 'HW-2021-156',
      assetName: 'Lenovo ThinkPad X1 Carbon',
      assetType: 'Hardware',
      assetTag: 'HW-2021-156',
      movementType: 'Storage',
      status: 'Completed',
      from: {
        location: 'Main Building - 2nd Floor',
        building: 'Main Building',
        room: 'Room 210',
        person: 'David Kumar'
      },
      to: {
        location: 'IT Storage',
        building: 'Main Building',
        room: 'Basement - IT Storage'
      },
      requestedBy: {
        name: 'IT Manager',
        department: 'IT Department',
        email: 'it.manager@company.com'
      },
      dates: {
        requested: '2024-10-12',
        scheduled: '2024-10-13',
        completed: '2024-10-13'
      },
      notes: 'Employee upgraded to new laptop',
      tracking: {
        currentLocation: 'Stored in IT Storage - Basement',
        lastUpdate: '2024-10-13 4:20 PM'
      }
    },
    {
      id: '5',
      assetId: 'HW-2024-012',
      assetName: 'Cisco Catalyst 9300',
      assetType: 'Hardware',
      assetTag: 'HW-2024-012',
      movementType: 'Transfer',
      status: 'Pending',
      from: {
        location: 'Data Center - Server Room A',
        building: 'Data Center',
        room: 'Server Room A'
      },
      to: {
        location: 'Data Center - Network Room',
        building: 'Data Center',
        room: 'Network Room'
      },
      requestedBy: {
        name: 'Network Admin',
        department: 'IT Infrastructure',
        email: 'network.admin@company.com'
      },
      dates: {
        requested: '2024-10-21',
        scheduled: '2024-10-23'
      },
      notes: 'Network reconfiguration - moving to dedicated network room',
      tracking: {
        currentLocation: 'Still in Server Room A',
        lastUpdate: '2024-10-21 8:00 AM',
        estimatedArrival: '2024-10-23'
      }
    },
    {
      id: '6',
      assetId: 'SW-2024-005',
      assetName: 'Adobe Creative Cloud License',
      assetType: 'Software',
      assetTag: 'SW-2024-005',
      movementType: 'Assignment',
      status: 'Completed',
      from: {
        location: 'License Pool',
        building: 'Virtual',
        room: 'Available Licenses'
      },
      to: {
        location: 'Design Team',
        building: 'Main Building',
        room: '3rd Floor',
        person: 'Lisa Martinez'
      },
      requestedBy: {
        name: 'Design Manager',
        department: 'Design',
        email: 'design@company.com'
      },
      dates: {
        requested: '2024-10-19',
        scheduled: '2024-10-20',
        completed: '2024-10-20'
      },
      notes: 'License assignment for new designer',
      tracking: {
        currentLocation: 'Assigned to Lisa Martinez',
        lastUpdate: '2024-10-20 11:15 AM'
      }
    },
    {
      id: '7',
      assetId: 'HW-2023-078',
      assetName: 'Synology DS1821+ NAS',
      assetType: 'Hardware',
      assetTag: 'HW-2023-078',
      movementType: 'Return',
      status: 'Completed',
      from: {
        location: 'Branch Office',
        building: 'Branch Office - Downtown',
        room: 'Server Room'
      },
      to: {
        location: 'Main Data Center',
        building: 'Data Center',
        room: 'Server Room B'
      },
      requestedBy: {
        name: 'Infrastructure Team',
        department: 'IT Infrastructure',
        email: 'infrastructure@company.com'
      },
      dates: {
        requested: '2024-10-10',
        scheduled: '2024-10-15',
        completed: '2024-10-16'
      },
      notes: 'Consolidating storage infrastructure to main data center',
      tracking: {
        currentLocation: 'Installed in Server Room B',
        lastUpdate: '2024-10-16 2:30 PM'
      }
    },
    {
      id: '8',
      assetId: 'HW-2020-234',
      assetName: 'HP ProDesk 600 G5',
      assetType: 'Hardware',
      assetTag: 'HW-2020-234',
      movementType: 'Disposal',
      status: 'In Transit',
      from: {
        location: 'IT Storage',
        building: 'Main Building',
        room: 'Basement Storage'
      },
      to: {
        location: 'E-Waste Facility',
        building: 'External',
        room: 'Certified E-Waste Recycler'
      },
      requestedBy: {
        name: 'IT Manager',
        department: 'IT Department',
        email: 'it.manager@company.com'
      },
      dates: {
        requested: '2024-10-18',
        scheduled: '2024-10-21'
      },
      notes: 'End of life disposal - asset retired',
      tracking: {
        currentLocation: 'In transit to e-waste facility',
        lastUpdate: '2024-10-21 8:30 AM',
        estimatedArrival: '2024-10-21'
      }
    }
  ]

  const stats = {
    totalMovements: assetMovements.length,
    inTransit: assetMovements.filter(m => m.status === 'In Transit').length,
    completed: assetMovements.filter(m => m.status === 'Completed').length,
    pending: assetMovements.filter(m => m.status === 'Pending').length,
    thisMonth: assetMovements.filter(m => m.dates.requested.startsWith('2024-10')).length
  }

  const filteredMovements = assetMovements.filter(movement => {
    const matchesType = selectedType === 'All' || movement.assetType === selectedType
    const matchesStatus = selectedStatus === 'All' || movement.status === selectedStatus
    const matchesSearch = movement.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.movementType.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'In Transit': return 'bg-blue-100 text-blue-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'Transfer': return TrendingUp
      case 'Assignment': return User
      case 'Return': return Package
      case 'Maintenance': return AlertCircle
      case 'Storage': return Archive
      case 'Disposal': return Archive
      default: return Package
    }
  }

  return (
    <div className="p-6 space-y-3">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading asset movements…</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Tracking</h1>
          <p className="text-gray-600 mt-1">Track asset locations and movements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          New Movement
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Movements</p>
              <p className="text-2xl font-bold mt-1">{stats.totalMovements}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold mt-1">{stats.inTransit}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold mt-1">{stats.thisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
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
                placeholder="Search by asset name, tag, or movement type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Equipment">Equipment</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Asset</th>
                <th className="text-left p-3 font-medium text-gray-600">Movement Type</th>
                <th className="text-left p-3 font-medium text-gray-600">Status</th>
                <th className="text-left p-3 font-medium text-gray-600">From</th>
                <th className="text-left p-3 font-medium text-gray-600">To</th>
                <th className="text-left p-3 font-medium text-gray-600">Requested</th>
                <th className="text-left p-3 font-medium text-gray-600">Scheduled</th>
                <th className="text-left p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMovements.map((movement) => {
                const MovementIcon = getMovementIcon(movement.movementType)
                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <MovementIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{movement.assetName}</p>
                          <p className="text-sm text-gray-600">{movement.assetTag}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">{movement.movementType}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                        {movement.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{movement.from.building}</p>
                          <p className="text-xs text-gray-600">{movement.from.room}</p>
                          {movement.from.person && (
                            <p className="text-xs text-blue-600">{movement.from.person}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{movement.to.building}</p>
                          <p className="text-xs text-gray-600">{movement.to.room}</p>
                          {movement.to.person && (
                            <p className="text-xs text-blue-600">{movement.to.person}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{movement.dates.requested}</p>
                      <p className="text-xs text-gray-600">{movement.requestedBy.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{movement.dates.scheduled}</p>
                      {movement.dates.completed && (
                        <p className="text-xs text-green-600">Done: {movement.dates.completed}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMovement(movement)
                            setShowDetailModal(true)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm">
                          <History className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">History</span>
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
      {showDetailModal && selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Movement Details</h2>
                <p className="text-sm text-gray-600">{selectedMovement.assetTag}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Asset Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Asset Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Asset Name</p>
                    <p className="font-medium">{selectedMovement.assetName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asset Tag</p>
                    <p className="font-medium">{selectedMovement.assetTag}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asset Type</p>
                    <p className="font-medium">{selectedMovement.assetType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Movement Type</p>
                    <p className="font-medium">{selectedMovement.movementType}</p>
                  </div>
                </div>
              </div>

              {/* Movement Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Movement Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMovement.status)}`}>
                  {selectedMovement.status}
                </span>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Current Location</p>
                  <p className="font-medium">{selectedMovement.tracking.currentLocation}</p>
                  <p className="text-xs text-gray-500 mt-1">Last updated: {selectedMovement.tracking.lastUpdate}</p>
                  {selectedMovement.tracking.estimatedArrival && (
                    <p className="text-xs text-blue-600 mt-1">
                      Estimated arrival: {selectedMovement.tracking.estimatedArrival}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Location Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">From:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{selectedMovement.from.building}</p>
                      <p className="text-sm text-gray-600">{selectedMovement.from.room}</p>
                      {selectedMovement.from.person && (
                        <p className="text-sm text-blue-600 mt-1">Person: {selectedMovement.from.person}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">To:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{selectedMovement.to.building}</p>
                      <p className="text-sm text-gray-600">{selectedMovement.to.room}</p>
                      {selectedMovement.to.person && (
                        <p className="text-sm text-blue-600 mt-1">Person: {selectedMovement.to.person}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Requested</p>
                      <p className="text-sm text-gray-600">{selectedMovement.dates.requested}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Scheduled</p>
                      <p className="text-sm text-gray-600">{selectedMovement.dates.scheduled}</p>
                    </div>
                  </div>
                  {selectedMovement.dates.completed && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-sm text-gray-600">{selectedMovement.dates.completed}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Request Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Requested By</p>
                    <p className="font-medium">{selectedMovement.requestedBy.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{selectedMovement.requestedBy.department}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedMovement.requestedBy.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{selectedMovement.notes}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedMovement.status === 'In Transit' && (
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Mark as Completed
                  </button>
                )}
                {selectedMovement.status === 'Pending' && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Start Movement
                    </button>
                    <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                      Cancel
                    </button>
                  </>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
