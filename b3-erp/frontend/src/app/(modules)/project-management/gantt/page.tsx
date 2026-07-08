'use client'

import { useState, useEffect } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import {
  Calendar,
  ZoomIn,
  ZoomOut,
  Plus,
  Save,
  Download,
  Filter,
  Settings,
  ChevronDown,
  Clock,
} from 'lucide-react'

interface GanttTask extends Task {
  assignedTo?: string[]
  status?: string
  priority?: string
}

import { projectManagementService, Project, ProjectTask } from '@/services/ProjectManagementService'

// ... imports

export default function GanttChartPage() {
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectTasks(selectedProjectId)
    }
  }, [selectedProjectId])

  const fetchProjects = async () => {
    try {
      const data = await projectManagementService.getProjects()
      setProjects(data)
      if (data.length > 0) {
        setSelectedProjectId(data[0].id)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setIsLoading(false)
    }
  }

  const fetchProjectTasks = async (projectId: string) => {
    setIsLoading(true)
    try {
      const projectTasks = await projectManagementService.getTasks(projectId)
      const ganttTasks: GanttTask[] = projectTasks.map(t => ({
        start: new Date(t.startDate || new Date()),
        end: new Date(t.endDate || new Date()),
        name: t.name,
        id: t.id,
        type: t.parentTaskId ? 'task' : 'project',
        progress: t.progress,
        isDisabled: false,
        project: t.parentTaskId,
        dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        assignedTo: t.assignedTo,
        status: t.status,
        priority: t.priority,
        styles: { progressColor: t.status === 'Completed' ? '#10b981' : '#3b82f6', progressSelectedColor: '#2563eb' },
      }))

      if (ganttTasks.length === 0) {
        // Add a dummy task if empty to avoid Gantt crash or show empty state
        // For now, we just set empty
      }

      setTasks(ganttTasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskChange = async (task: Task) => {
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)))
    try {
      await projectManagementService.updateTask(task.id, {
        startDate: task.start,
        endDate: task.end,
      })
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleProgressChange = async (task: Task) => {
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)))
    try {
      await projectManagementService.updateTask(task.id, { progress: task.progress })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleTaskDelete = async (task: Task) => {
    const confirmDelete = window.confirm(`Delete task: ${task.name}?`)
    if (confirmDelete) {
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id))
      try {
        await projectManagementService.deleteTask(task.id)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleTaskSelect = (task: Task, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTask(task as GanttTask)
    } else {
      setSelectedTask(null)
    }
  }

  const handleExpanderClick = (task: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === task.id ? { ...t, hideChildren: !t.hideChildren } : t))
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading Gantt chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Gantt Chart</h1>
          <p className="text-gray-500 mt-1">Visual timeline and task management</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(ViewMode.Hour)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === ViewMode.Hour
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Hour
              </button>
              <button
                onClick={() => setViewMode(ViewMode.Day)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === ViewMode.Day
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode(ViewMode.Week)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === ViewMode.Week
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode(ViewMode.Month)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === ViewMode.Month
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total Tasks: {tasks.length}</span>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-sm text-gray-600">
              Completed:{' '}
              {tasks.filter((t) => t.progress === 100 && t.type !== 'milestone').length}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-gray-400"></div>
            <div className="w-2 h-2 border-2 border-gray-400 rotate-45"></div>
            <span className="text-gray-700">Dependency</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onProgressChange={handleProgressChange}
          onDelete={handleTaskDelete}
          onSelect={handleTaskSelect}
          onExpanderClick={handleExpanderClick}
          listCellWidth="200px"
          columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 65}
          ganttHeight={600}
          barBackgroundColor="#e5e7eb"
          barProgressColor="#3b82f6"
          barProgressSelectedColor="#2563eb"
          arrowColor="#6b7280"
          fontSize="14px"
          fontFamily="Inter, sans-serif"
          todayColor="rgba(239, 68, 68, 0.2)"
          TooltipContent={({ task }) => (
            <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
              <div className="font-semibold mb-2">{task.name}</div>
              <div className="text-sm space-y-1">
                <div>
                  Start: {task.start.toLocaleDateString()}
                </div>
                <div>
                  End: {task.end.toLocaleDateString()}
                </div>
                <div>
                  Progress: {task.progress}%
                </div>
                {(task as GanttTask).assignedTo && (
                  <div>
                    Assigned: {(task as GanttTask).assignedTo?.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </div>

      {/* Selected Task Details */}
      {selectedTask && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <p className="text-sm text-gray-500">Task Name</p>
              <p className="font-medium text-gray-900">{selectedTask.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="font-medium text-gray-900">{selectedTask.progress}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium text-gray-900">
                {selectedTask.start.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium text-gray-900">
                {selectedTask.end.toLocaleDateString()}
              </p>
            </div>
            {selectedTask.assignedTo && (
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium text-gray-900">{selectedTask.assignedTo.join(', ')}</p>
              </div>
            )}
            {selectedTask.status && (
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedTask.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : selectedTask.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {selectedTask.status.replace('_', ' ')}
                </span>
              </div>
            )}
            {selectedTask.priority && (
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedTask.priority === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : selectedTask.priority === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : selectedTask.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {selectedTask.priority}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
