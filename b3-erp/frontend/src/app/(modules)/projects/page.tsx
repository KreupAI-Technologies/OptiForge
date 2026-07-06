'use client'

import { useState, useEffect } from 'react'
import { projectManagementService } from '@/services/ProjectManagementService'
import {
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Activity
} from 'lucide-react'

interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  delayedProjects: number
  totalBudget: number
  totalSpent: number
  resourcesAllocated: number
  avgCompletionRate: number
  onTimeDelivery: number
  budgetUtilization: number
}

interface Project {
  id: string
  name: string
  customer: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'delayed'
  progress: number
  budget: number
  spent: number
  startDate: string
  endDate: string
  manager: string
  team: number
  priority: 'high' | 'medium' | 'low'
}

interface Milestone {
  id: string
  project: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  dueDate: string
  completion: number
  assignedTo: string
}

export default function ProjectsDashboard() {
  const STATUS_MAP: Record<string, Project['status']> = {
    completed: 'completed', done: 'completed', 'in_progress': 'in_progress', 'in-progress': 'in_progress',
    active: 'in_progress', on_hold: 'on_hold', 'on-hold': 'on_hold', hold: 'on_hold',
    delayed: 'delayed', overdue: 'delayed', planning: 'planning', planned: 'planning', pending: 'planning',
  }
  const MS_STATUS_MAP: Record<string, Milestone['status']> = {
    completed: 'completed', done: 'completed', 'in_progress': 'in_progress', 'in-progress': 'in_progress',
    delayed: 'delayed', overdue: 'delayed', pending: 'pending', planned: 'pending',
  }

  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [upcomingMilestones, setUpcomingMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    projectManagementService.getProjects()
      .then((rows) => {
        setActiveProjects((Array.isArray(rows) ? rows : []).map((p: any) => ({
          id: String(p.id ?? p.projectCode ?? ''),
          name: p.name ?? p.projectName ?? p.projectCode ?? 'Project',
          customer: p.customer ?? p.client ?? p.customerName ?? '',
          status: STATUS_MAP[String(p.status ?? '').toLowerCase()] ?? 'planning',
          progress: Number(p.progress ?? p.progressPercentage ?? 0),
          budget: Number(p.budget ?? p.estimatedBudget ?? 0),
          spent: Number(p.spent ?? p.actualBudget ?? p.actualCost ?? 0),
          startDate: p.startDate ?? '',
          endDate: p.endDate ?? '',
          manager: p.manager ?? p.projectManager ?? '',
          team: Number(p.team ?? p.teamSize ?? 0),
          priority: (String(p.priority ?? 'medium').toLowerCase() as Project['priority']),
        })))
      })
      .catch(() => setActiveProjects([]))

    projectManagementService.listAllMilestones()
      .then((rows) => {
        setUpcomingMilestones((Array.isArray(rows) ? rows : []).map((m: any, idx: number) => ({
          id: String(m.id ?? m.milestoneId ?? idx),
          project: String(m.projectId ?? m.project ?? ''),
          title: m.title ?? m.name ?? m.milestoneName ?? 'Milestone',
          status: MS_STATUS_MAP[String(m.status ?? '').toLowerCase()] ?? 'pending',
          dueDate: m.dueDate ?? m.targetDate ?? '',
          completion: Number(m.completion ?? m.percentComplete ?? m.progress ?? 0),
          assignedTo: m.assignedTo ?? m.owner ?? '',
        })))
      })
      .catch(() => setUpcomingMilestones([]))
  }, [])

  const stats: ProjectStats = (() => {
    const total = activeProjects.length
    const active = activeProjects.filter(p => p.status === 'in_progress').length
    const completed = activeProjects.filter(p => p.status === 'completed').length
    const delayed = activeProjects.filter(p => p.status === 'delayed').length
    const totalBudget = activeProjects.reduce((s, p) => s + p.budget, 0)
    const totalSpent = activeProjects.reduce((s, p) => s + p.spent, 0)
    const avgCompletionRate = total ? Math.round((activeProjects.reduce((s, p) => s + p.progress, 0) / total) * 10) / 10 : 0
    return {
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      delayedProjects: delayed,
      totalBudget,
      totalSpent,
      resourcesAllocated: activeProjects.reduce((s, p) => s + p.team, 0),
      avgCompletionRate,
      onTimeDelivery: total ? Math.round(((total - delayed) / total) * 1000) / 10 : 0,
      budgetUtilization: totalBudget ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0,
    }
  })()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_progress':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'delayed':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'delayed':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-orange-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-1">Planning, tracking, and resource management</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md">
            <Briefcase className="h-5 w-5" />
            New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Projects</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.activeProjects}</p>
                <p className="text-xs text-blue-700 mt-1">{stats.totalProjects} total projects</p>
              </div>
              <Briefcase className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Budget Utilization</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.budgetUtilization}%</p>
                <p className="text-xs text-green-700 mt-1">₹{(stats.totalSpent / 10000000).toFixed(1)}Cr spent</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Resources Allocated</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.resourcesAllocated}</p>
                <p className="text-xs text-purple-700 mt-1">Team members</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.onTimeDelivery}%</p>
                <p className="text-xs text-orange-700 mt-1">{stats.delayedProjects} delayed</p>
              </div>
              <CheckCircle className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Active Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {activeProjects.map((project) => (
                  <div key={project.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{project.customer}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.status === 'delayed'
                              ? 'bg-red-500'
                              : project.progress >= 75
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <div>
                          <p className="text-gray-600 text-xs">Budget</p>
                          <p className="font-semibold text-gray-900">₹{(project.budget / 10000000).toFixed(1)}Cr</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-xs">Spent</p>
                          <p className="font-semibold text-gray-900">₹{(project.spent / 10000000).toFixed(1)}Cr</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-xs">Team</p>
                          <p className="font-semibold text-gray-900">{project.team}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{project.startDate} to {project.endDate}</span>
                        <span className={`font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Milestones</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{milestone.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{milestone.project}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-medium text-gray-900">{milestone.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            milestone.status === 'completed'
                              ? 'bg-green-500'
                              : milestone.status === 'delayed'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${milestone.completion}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">Due: {milestone.dueDate}</span>
                        </div>
                        <span className="text-xs text-gray-600">{milestone.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgCompletionRate}%</p>
                <p className="text-xs text-green-600 mt-1">Across all projects</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedProjects}</p>
                <p className="text-xs text-green-600 mt-1">This quarter</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delayed Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.delayedProjects}</p>
                <p className="text-xs text-red-600 mt-1">Requires attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
