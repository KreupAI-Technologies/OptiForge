'use client'

import { useState, useEffect } from 'react'
import { projectManagementService } from '@/services/ProjectManagementService'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react'

interface Resource {
  id: string
  name: string
  role: string
  skills: string[]
  hourlyRate: number
  availability: number
  allocations: ProjectAllocation[]
}

interface ProjectAllocation {
  projectId: string
  projectName: string
  allocationPercentage: number
  startDate: string
  endDate: string
  color: string
}

interface UtilizationData {
  name: string
  allocated: number
  available: number
  utilizationRate: number
}

export default function ResourceCapacityPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedView, setSelectedView] = useState<'matrix' | 'utilization' | 'calendar'>('matrix')
  const [searchQuery, setSearchQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResourceData()
  }, [])

  const fetchResourceData = async () => {
    setIsLoading(true)
    try {
      const [allocRows, resourceRows] = await Promise.all([
        projectManagementService.getPmResourceAllocations().catch(() => []),
        projectManagementService.listAllResources().catch(() => []),
      ])
      const palette = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]
      const byResource = new Map<string, Resource>()
      const ensure = (id: string, name: string, role: string, skills: string[], rate: number): Resource => {
        let r = byResource.get(id)
        if (!r) {
          r = { id, name, role, skills, hourlyRate: rate, availability: 100, allocations: [] }
          byResource.set(id, r)
        }
        return r
      }
      ;(Array.isArray(resourceRows) ? resourceRows : []).forEach((res: any) => {
        const id = String(res.id ?? res.resourceId ?? res.employeeId ?? res.name ?? "")
        if (!id) return
        ensure(id, res.name ?? res.resourceName ?? res.employeeName ?? "Resource", res.role ?? res.designation ?? res.resourceType ?? "", Array.isArray(res.skills) ? res.skills : [], Number(res.hourlyRate ?? res.rate ?? 0))
      })
      ;(Array.isArray(allocRows) ? allocRows : []).forEach((a: any, idx: number) => {
        const rid = String(a.resourceId ?? a.employeeId ?? a.resource ?? a.resourceName ?? a.name ?? `res-${idx}`)
        const r = ensure(rid, a.resourceName ?? a.employeeName ?? a.resource ?? a.name ?? "Resource", a.role ?? a.designation ?? "", [], Number(a.hourlyRate ?? 0))
        r.allocations.push({
          projectId: String(a.projectId ?? a.project ?? ""),
          projectName: a.projectName ?? a.project ?? "",
          allocationPercentage: Number(a.allocationPercentage ?? a.allocation ?? a.percentage ?? 0),
          startDate: a.startDate ?? "",
          endDate: a.endDate ?? "",
          color: palette[idx % palette.length],
        })
      })
      setResources(Array.from(byResource.values()))
    } catch {
      setResources([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateUtilization = (resource: Resource): number => {
    return resource.allocations.reduce((sum, alloc) => sum + alloc.allocationPercentage, 0)
  }

  const getUtilizationStatus = (utilization: number): { color: string; text: string } => {
    if (utilization > 100) return { color: 'text-red-600 bg-red-100', text: 'Overallocated' }
    if (utilization >= 80) return { color: 'text-yellow-600 bg-yellow-100', text: 'Fully Allocated' }
    return { color: 'text-green-600 bg-green-100', text: 'Available' }
  }

  const utilizationChartData: UtilizationData[] = resources.map((resource) => {
    const allocated = calculateUtilization(resource)
    return {
      name: resource.name.split(' ')[0],
      allocated,
      available: resource.availability - allocated,
      utilizationRate: allocated,
    }
  })

  const allSkills = Array.from(new Set(resources.flatMap((r) => r.skills)))

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = skillFilter === 'all' || resource.skills.includes(skillFilter)
    return matchesSearch && matchesSkill
  })

  const stats = {
    totalResources: resources.length,
    fullyAllocated: resources.filter((r) => calculateUtilization(r) >= 80).length,
    overallocated: resources.filter((r) => calculateUtilization(r) > 100).length,
    avgUtilization: resources.length
      ? Math.round(
        resources.reduce((sum, r) => sum + calculateUtilization(r), 0) / resources.length
      )
      : 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Capacity Planning</h1>
          <p className="text-gray-500 mt-1">Team allocation, utilization tracking, and capacity planning</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Allocate Resource
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Resources</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResources}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fully Allocated (≥80%)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.fullyAllocated}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overallocated ({'>'} 100%)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overallocated}</p>
              {stats.overallocated > 0 && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Needs attention
                </p>
              )}
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Utilization</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgUtilization}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs and Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('matrix')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedView === 'matrix'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Allocation Matrix
            </button>
            <button
              onClick={() => setSelectedView('utilization')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedView === 'utilization'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Utilization Chart
            </button>
            <button
              onClick={() => setSelectedView('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Calendar View
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Skills</option>
              {allSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Allocation Matrix View */}
      {selectedView === 'matrix' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Resource
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map((resource) => {
                  const utilization = calculateUtilization(resource)
                  const status = getUtilizationStatus(utilization)

                  return (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {resource.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                            <div className="text-sm text-gray-500">${resource.hourlyRate}/hr</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {resource.role}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {resource.skills.slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {resource.skills.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              +{resource.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-2">
                          {resource.allocations.map((alloc) => (
                            <div key={alloc.projectId} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: alloc.color }}
                              ></div>
                              <span className="text-sm text-gray-900">{alloc.projectName}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {alloc.allocationPercentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${utilization > 100
                                  ? 'bg-red-500'
                                  : utilization >= 80
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{utilization}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {Math.max(0, resource.availability - utilization)}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Utilization Chart View */}
      {selectedView === 'utilization' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Utilization Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={utilizationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Allocation %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="allocated" stackId="a" name="Allocated">
                {utilizationChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.utilizationRate > 100
                        ? '#ef4444'
                        : entry.utilizationRate >= 80
                          ? '#f59e0b'
                          : '#10b981'
                    }
                  />
                ))}
              </Bar>
              <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm text-gray-500">Available ({'<'} 80%)</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <p className="text-2xl font-bold text-gray-900">
                  {utilizationChartData.filter((d) => d.utilizationRate < 80).length}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fully Allocated (80-100%)</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    utilizationChartData.filter(
                      (d) => d.utilizationRate >= 80 && d.utilizationRate <= 100
                    ).length
                  }
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overallocated ({'>'} 100%)</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <p className="text-2xl font-bold text-gray-900">
                  {utilizationChartData.filter((d) => d.utilizationRate > 100).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">Calendar View</p>
              <p className="text-sm text-gray-400 mt-2">Timeline allocation view coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
