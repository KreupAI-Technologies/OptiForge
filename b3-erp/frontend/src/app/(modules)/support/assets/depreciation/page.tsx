'use client'

import { useState, useEffect } from 'react'
import { Wrench, Calendar, CheckCircle, AlertCircle, Clock, DollarSign, User, FileText, TrendingUp, Eye, Edit, Plus, Search, Filter } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface MaintenanceSchedule {
  id: string
  assetId: string
  assetName: string
  assetCategory: 'Hardware' | 'Equipment' | 'Infrastructure'
  assetTag: string
  maintenanceType: 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency'
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  schedule: {
    frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'One-time'
    lastMaintenance: string
    nextMaintenance: string
    dueDate: string
  }
  details: {
    description: string
    estimatedDuration: string
    estimatedCost: number
    actualCost?: number
  }
  assignment: {
    technician: string
    team: string
    contactEmail: string
  }
  location: {
    building: string
    floor: string
    room: string
  }
  warranty: {
    covered: boolean
    expiryDate: string
    vendor: string
  }
  history: {
    totalServices: number
    lastServiceDate: string
    avgDowntime: string
  }
}

export default function AssetDepreciation() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceSchedule | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = (await supportPagesService.getHardwareAssets()) as any[]
        const mapped: MaintenanceSchedule[] = (Array.isArray(raw) ? raw : []).map((a: any) => ({
          id: String(a?.id ?? a?.assetId ?? a?.assetTag ?? ''),
          assetId: String(a?.assetId ?? a?.id ?? ''),
          assetName: a?.assetName ?? a?.name ?? 'Unknown Asset',
          assetCategory: (a?.assetCategory ?? a?.category ?? 'Hardware') as MaintenanceSchedule['assetCategory'],
          assetTag: a?.assetTag ?? a?.tag ?? a?.assetId ?? String(a?.id ?? ''),
          maintenanceType: (a?.maintenanceType ?? 'Preventive') as MaintenanceSchedule['maintenanceType'],
          status: (a?.status ?? 'Scheduled') as MaintenanceSchedule['status'],
          priority: (a?.priority ?? 'Medium') as MaintenanceSchedule['priority'],
          schedule: {
            frequency: (a?.schedule?.frequency ?? a?.frequency ?? 'Quarterly') as MaintenanceSchedule['schedule']['frequency'],
            lastMaintenance: a?.schedule?.lastMaintenance ?? a?.lastMaintenance ?? '',
            nextMaintenance: a?.schedule?.nextMaintenance ?? a?.nextMaintenance ?? '',
            dueDate: a?.schedule?.dueDate ?? a?.dueDate ?? '',
          },
          details: {
            description: a?.details?.description ?? a?.description ?? '',
            estimatedDuration: a?.details?.estimatedDuration ?? a?.estimatedDuration ?? '',
            estimatedCost: Number(a?.details?.estimatedCost ?? a?.estimatedCost ?? 0),
            actualCost: a?.details?.actualCost ?? a?.actualCost ?? undefined,
          },
          assignment: {
            technician: a?.assignment?.technician ?? a?.technician ?? '',
            team: a?.assignment?.team ?? a?.team ?? '',
            contactEmail: a?.assignment?.contactEmail ?? a?.contactEmail ?? '',
          },
          location: {
            building: a?.location?.building ?? a?.building ?? '',
            floor: a?.location?.floor ?? a?.floor ?? '',
            room: a?.location?.room ?? a?.room ?? '',
          },
          warranty: {
            covered: Boolean(a?.warranty?.covered ?? a?.warrantyCovered ?? false),
            expiryDate: a?.warranty?.expiryDate ?? a?.warrantyExpiryDate ?? '',
            vendor: a?.warranty?.vendor ?? a?.vendor ?? '',
          },
          history: {
            totalServices: Number(a?.history?.totalServices ?? a?.totalServices ?? 0),
            lastServiceDate: a?.history?.lastServiceDate ?? a?.lastServiceDate ?? '',
            avgDowntime: a?.history?.avgDowntime ?? a?.avgDowntime ?? '',
          },
        }))
        if (!cancelled) setMaintenanceSchedules(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load maintenance schedules')
          setMaintenanceSchedules([])
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

  const maintenanceSchedulesSeed: MaintenanceSchedule[] = [
    {
      id: '1',
      assetId: 'HW-2023-045',
      assetName: 'Dell PowerEdge R750',
      assetCategory: 'Hardware',
      assetTag: 'HW-2023-045',
      maintenanceType: 'Preventive',
      status: 'Scheduled',
      priority: 'High',
      schedule: {
        frequency: 'Quarterly',
        lastMaintenance: '2024-07-15',
        nextMaintenance: '2024-10-25',
        dueDate: '2024-10-25'
      },
      details: {
        description: 'Quarterly server maintenance: Clean components, update firmware, check RAID status, verify backups',
        estimatedDuration: '3 hours',
        estimatedCost: 500
      },
      assignment: {
        technician: 'David Kumar',
        team: 'Infrastructure Team',
        contactEmail: 'david.k@company.com'
      },
      location: {
        building: 'Data Center',
        floor: 'Ground Floor',
        room: 'Server Room A'
      },
      warranty: {
        covered: true,
        expiryDate: '2028-03-10',
        vendor: 'Dell EMC'
      },
      history: {
        totalServices: 6,
        lastServiceDate: '2024-07-15',
        avgDowntime: '2.5 hours'
      }
    },
    {
      id: '2',
      assetId: 'HW-2022-089',
      assetName: 'HP LaserJet Enterprise M608',
      assetCategory: 'Hardware',
      assetTag: 'HW-2022-089',
      maintenanceType: 'Corrective',
      status: 'In Progress',
      priority: 'Critical',
      schedule: {
        frequency: 'One-time',
        lastMaintenance: '2024-09-15',
        nextMaintenance: '2024-10-21',
        dueDate: '2024-10-21'
      },
      details: {
        description: 'Fix persistent paper jam issue, replace fuser unit, clean paper rollers',
        estimatedDuration: '2 hours',
        estimatedCost: 350,
        actualCost: 380
      },
      assignment: {
        technician: 'External Service',
        team: 'HP Service Center',
        contactEmail: 'service@hp.com'
      },
      location: {
        building: 'Main Building',
        floor: '1st Floor',
        room: 'Print Room'
      },
      warranty: {
        covered: true,
        expiryDate: '2025-08-15',
        vendor: 'HP'
      },
      history: {
        totalServices: 12,
        lastServiceDate: '2024-09-15',
        avgDowntime: '1.5 hours'
      }
    },
    {
      id: '3',
      assetId: 'HW-2024-012',
      assetName: 'Cisco Catalyst 9300',
      assetCategory: 'Infrastructure',
      assetTag: 'HW-2024-012',
      maintenanceType: 'Preventive',
      status: 'Scheduled',
      priority: 'Medium',
      schedule: {
        frequency: 'Semi-Annual',
        lastMaintenance: '2024-05-01',
        nextMaintenance: '2024-11-01',
        dueDate: '2024-11-01'
      },
      details: {
        description: 'Network switch maintenance: Firmware updates, port cleaning, configuration backup, performance testing',
        estimatedDuration: '1.5 hours',
        estimatedCost: 200
      },
      assignment: {
        technician: 'Network Admin Team',
        team: 'IT Infrastructure',
        contactEmail: 'network.admin@company.com'
      },
      location: {
        building: 'Data Center',
        floor: 'Ground Floor',
        room: 'Network Room'
      },
      warranty: {
        covered: true,
        expiryDate: '2027-02-01',
        vendor: 'Cisco'
      },
      history: {
        totalServices: 1,
        lastServiceDate: '2024-05-01',
        avgDowntime: '1 hour'
      }
    },
    {
      id: '4',
      assetId: 'HW-2023-078',
      assetName: 'Synology DS1821+ NAS',
      assetCategory: 'Hardware',
      assetTag: 'HW-2023-078',
      maintenanceType: 'Preventive',
      status: 'Completed',
      priority: 'High',
      schedule: {
        frequency: 'Semi-Annual',
        lastMaintenance: '2024-09-20',
        nextMaintenance: '2025-03-20',
        dueDate: '2025-03-20'
      },
      details: {
        description: 'NAS maintenance: Disk health check, SMART analysis, DSM update, backup verification',
        estimatedDuration: '2 hours',
        estimatedCost: 300,
        actualCost: 280
      },
      assignment: {
        technician: 'Robert Brown',
        team: 'Database Team',
        contactEmail: 'robert.b@company.com'
      },
      location: {
        building: 'Data Center',
        floor: 'Ground Floor',
        room: 'Server Room B'
      },
      warranty: {
        covered: true,
        expiryDate: '2026-09-20',
        vendor: 'Synology'
      },
      history: {
        totalServices: 4,
        lastServiceDate: '2024-09-20',
        avgDowntime: '1.8 hours'
      }
    },
    {
      id: '5',
      assetId: 'HVAC-2020-001',
      assetName: 'Data Center HVAC System',
      assetCategory: 'Infrastructure',
      assetTag: 'HVAC-2020-001',
      maintenanceType: 'Preventive',
      status: 'Overdue',
      priority: 'Critical',
      schedule: {
        frequency: 'Quarterly',
        lastMaintenance: '2024-07-10',
        nextMaintenance: '2024-10-10',
        dueDate: '2024-10-10'
      },
      details: {
        description: 'HVAC maintenance: Filter replacement, coolant level check, compressor inspection, temperature calibration',
        estimatedDuration: '4 hours',
        estimatedCost: 1200
      },
      assignment: {
        technician: 'Facilities Team',
        team: 'Facilities Management',
        contactEmail: 'facilities@company.com'
      },
      location: {
        building: 'Data Center',
        floor: 'Ground Floor',
        room: 'HVAC Room'
      },
      warranty: {
        covered: false,
        expiryDate: '2023-06-15',
        vendor: 'HVAC Solutions Inc'
      },
      history: {
        totalServices: 18,
        lastServiceDate: '2024-07-10',
        avgDowntime: '3.5 hours'
      }
    },
    {
      id: '6',
      assetId: 'UPS-2021-003',
      assetName: 'APC Smart-UPS 3000',
      assetCategory: 'Infrastructure',
      assetTag: 'UPS-2021-003',
      maintenanceType: 'Predictive',
      status: 'Scheduled',
      priority: 'High',
      schedule: {
        frequency: 'Annual',
        lastMaintenance: '2023-11-15',
        nextMaintenance: '2024-11-15',
        dueDate: '2024-11-15'
      },
      details: {
        description: 'UPS annual maintenance: Battery replacement, load testing, firmware update, event log review',
        estimatedDuration: '3 hours',
        estimatedCost: 800
      },
      assignment: {
        technician: 'Infrastructure Team',
        team: 'IT Infrastructure',
        contactEmail: 'infrastructure@company.com'
      },
      location: {
        building: 'Data Center',
        floor: 'Ground Floor',
        room: 'Power Room'
      },
      warranty: {
        covered: true,
        expiryDate: '2026-11-15',
        vendor: 'APC by Schneider Electric'
      },
      history: {
        totalServices: 3,
        lastServiceDate: '2023-11-15',
        avgDowntime: '2 hours'
      }
    },
    {
      id: '7',
      assetId: 'HW-2024-001',
      assetName: 'Dell OptiPlex 7090',
      assetCategory: 'Hardware',
      assetTag: 'HW-2024-001',
      maintenanceType: 'Preventive',
      status: 'Completed',
      priority: 'Low',
      schedule: {
        frequency: 'Semi-Annual',
        lastMaintenance: '2024-09-15',
        nextMaintenance: '2025-03-15',
        dueDate: '2025-03-15'
      },
      details: {
        description: 'Desktop maintenance: Clean internal components, update drivers, disk cleanup, malware scan',
        estimatedDuration: '1 hour',
        estimatedCost: 100,
        actualCost: 90
      },
      assignment: {
        technician: 'IT Support Team',
        team: 'Desktop Support',
        contactEmail: 'support@company.com'
      },
      location: {
        building: 'Main Building',
        floor: '3rd Floor',
        room: 'Room 305'
      },
      warranty: {
        covered: true,
        expiryDate: '2027-01-15',
        vendor: 'Dell'
      },
      history: {
        totalServices: 2,
        lastServiceDate: '2024-09-15',
        avgDowntime: '0.5 hours'
      }
    },
    {
      id: '8',
      assetId: 'FIRE-2019-001',
      assetName: 'Fire Suppression System',
      assetCategory: 'Infrastructure',
      assetTag: 'FIRE-2019-001',
      maintenanceType: 'Preventive',
      status: 'Scheduled',
      priority: 'Critical',
      schedule: {
        frequency: 'Quarterly',
        lastMaintenance: '2024-08-20',
        nextMaintenance: '2024-11-20',
        dueDate: '2024-11-20'
      },
      details: {
        description: 'Fire suppression system inspection: Pressure check, nozzle inspection, agent level verification, alarm testing',
        estimatedDuration: '2 hours',
        estimatedCost: 600
      },
      assignment: {
        technician: 'Safety Inspector',
        team: 'Safety & Compliance',
        contactEmail: 'safety@company.com'
      },
      location: {
        building: 'Data Center',
        floor: 'Ground Floor',
        room: 'Server Room A'
      },
      warranty: {
        covered: false,
        expiryDate: '2024-06-30',
        vendor: 'Fire Safety Systems Ltd'
      },
      history: {
        totalServices: 22,
        lastServiceDate: '2024-08-20',
        avgDowntime: '0 hours'
      }
    }
  ]

  const stats = {
    totalScheduled: maintenanceSchedules.length,
    upcoming: maintenanceSchedules.filter(m => m.status === 'Scheduled').length,
    inProgress: maintenanceSchedules.filter(m => m.status === 'In Progress').length,
    overdue: maintenanceSchedules.filter(m => m.status === 'Overdue').length,
    totalCost: maintenanceSchedules.reduce((sum, m) => sum + m.details.estimatedCost, 0),
    thisMonth: maintenanceSchedules.filter(m => 
      m.schedule.nextMaintenance && m.schedule.nextMaintenance.startsWith('2024-10')
    ).length
  }

  const filteredSchedules = maintenanceSchedules.filter(schedule => {
    const matchesCategory = selectedCategory === 'All' || schedule.assetCategory === selectedCategory
    const matchesStatus = selectedStatus === 'All' || schedule.status === selectedStatus
    const matchesSearch = schedule.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.assetTag.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700'
      case 'In Progress': return 'bg-yellow-100 text-yellow-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Overdue': return 'bg-red-100 text-red-700'
      case 'Cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600'
      case 'High': return 'text-orange-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading maintenance schedules…</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Maintenance</h1>
          <p className="text-gray-600 mt-1">Schedule and track asset maintenance activities</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Schedule Maintenance
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold mt-1">{stats.totalScheduled}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold mt-1">{stats.upcoming}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold mt-1">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
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

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Est. Cost</p>
              <p className="text-2xl font-bold mt-1">${(stats.totalCost / 1000).toFixed(1)}k</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
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
                placeholder="Search by asset name or tag..."
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
            <option value="Hardware">Hardware</option>
            <option value="Equipment">Equipment</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-2 gap-2">
        {filteredSchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-sm border p-3">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{schedule.assetName}</h3>
                  <p className="text-sm text-gray-600">{schedule.assetTag}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                  {schedule.status}
                </span>
              </div>
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-3 mb-2 pb-4 border-b">
              <div>
                <p className="text-xs text-gray-600">Maintenance Type</p>
                <p className="text-sm font-medium">{schedule.maintenanceType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Priority</p>
                <p className={`text-sm font-bold ${getPriorityColor(schedule.priority)}`}>
                  {schedule.priority}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Frequency</p>
                <p className="text-sm font-medium">{schedule.schedule.frequency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Category</p>
                <p className="text-sm font-medium">{schedule.assetCategory}</p>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <p className="text-xs text-gray-600">Last Maintenance</p>
                <p className="text-sm font-medium">{schedule.schedule.lastMaintenance}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Next Maintenance</p>
                <p className={`text-sm font-medium ${
                  schedule.status === 'Overdue' ? 'text-red-600' : ''
                }`}>
                  {schedule.schedule.nextMaintenance}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Est. Duration</p>
                <p className="text-sm font-medium">{schedule.details.estimatedDuration}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Est. Cost</p>
                <p className="text-sm font-medium">${schedule.details.estimatedCost}</p>
              </div>
            </div>

            {/* Assignment */}
            <div className="mb-2 pb-4 border-b">
              <p className="text-xs text-gray-600 mb-1">Assigned To</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{schedule.assignment.technician}</p>
                  <p className="text-xs text-gray-600">{schedule.assignment.team}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-2">
              <p className="text-xs text-gray-600 mb-1">Description</p>
              <p className="text-sm text-gray-700 line-clamp-2">{schedule.details.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedMaintenance(schedule)
                  setShowDetailModal(true)
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              {schedule.status === 'Scheduled' && (
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Start
                </button>
              )}
              {schedule.status === 'In Progress' && (
                <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  Complete
                </button>
              )}
            </div>

            {/* Alerts */}
            {schedule.status === 'Overdue' && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">Maintenance is overdue! Please schedule immediately.</p>
              </div>
            )}
            {!schedule.warranty.covered && schedule.details.estimatedCost > 500 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Not under warranty. High maintenance cost expected.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedMaintenance.assetName}</h2>
                <p className="text-sm text-gray-600">{selectedMaintenance.assetTag}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Maintenance Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Maintenance Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{selectedMaintenance.maintenanceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className={`font-bold ${getPriorityColor(selectedMaintenance.priority)}`}>
                      {selectedMaintenance.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMaintenance.status)}`}>
                      {selectedMaintenance.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-medium">{selectedMaintenance.schedule.frequency}</p>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Schedule Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Last Maintenance</p>
                    <p className="font-medium">{selectedMaintenance.schedule.lastMaintenance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Maintenance</p>
                    <p className="font-medium">{selectedMaintenance.schedule.nextMaintenance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">{selectedMaintenance.schedule.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="font-medium">{selectedMaintenance.details.estimatedDuration}</p>
                  </div>
                </div>
              </div>

              {/* Cost Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cost Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="font-medium">${selectedMaintenance.details.estimatedCost}</p>
                  </div>
                  {selectedMaintenance.details.actualCost && (
                    <div>
                      <p className="text-sm text-gray-600">Actual Cost</p>
                      <p className="font-medium">${selectedMaintenance.details.actualCost}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Assignment Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Technician</p>
                    <p className="font-medium">{selectedMaintenance.assignment.technician}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team</p>
                    <p className="font-medium">{selectedMaintenance.assignment.team}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="font-medium">{selectedMaintenance.assignment.contactEmail}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Building</p>
                    <p className="font-medium">{selectedMaintenance.location.building}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Floor</p>
                    <p className="font-medium">{selectedMaintenance.location.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room</p>
                    <p className="font-medium">{selectedMaintenance.location.room}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700">{selectedMaintenance.details.description}</p>
              </div>

              {/* Warranty Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Warranty Information</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Coverage Status</p>
                    <p className={`font-medium ${selectedMaintenance.warranty.covered ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedMaintenance.warranty.covered ? 'Covered' : 'Not Covered'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="font-medium">{selectedMaintenance.warranty.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vendor</p>
                    <p className="font-medium">{selectedMaintenance.warranty.vendor}</p>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Service History</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="font-medium">{selectedMaintenance.history.totalServices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Service</p>
                    <p className="font-medium">{selectedMaintenance.history.lastServiceDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Downtime</p>
                    <p className="font-medium">{selectedMaintenance.history.avgDowntime}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Schedule
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Full History
                </button>
                {selectedMaintenance.status === 'Scheduled' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Start Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
