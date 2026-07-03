'use client'

import { useState, useEffect } from 'react'
import { SupportScheduledChangeService } from '@/services/support.service'
import { Calendar, Clock, AlertCircle, CheckCircle, Users, Filter, ChevronLeft, ChevronRight, Eye, Play, Pause, XCircle } from 'lucide-react'

interface ScheduledChange {
  id: string
  ticketNumber: string
  title: string
  type: 'Standard' | 'Normal' | 'Emergency'
  category: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  implementer: string
  implementationDate: string
  implementationTime: string
  duration: string
  status: 'Scheduled' | 'In Progress' | 'On Hold' | 'Ready'
  affectedSystems: string[]
  downtime: boolean
  backupCompleted: boolean
  stakeholdersNotified: boolean
  changeWindow: string
  approvedBy: string
  approvalDate: string
  rollbackPlan: boolean
}

export default function ScheduledChanges() {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedChange, setSelectedChange] = useState<ScheduledChange | null>(null)

  const seedScheduledChanges: ScheduledChange[] = [
    {
      id: '1',
      ticketNumber: 'CHG-2024-1240',
      title: 'ERP System Upgrade to Version 12.5',
      type: 'Normal',
      category: 'Application',
      priority: 'P1',
      implementer: 'John Smith',
      implementationDate: '2024-10-28',
      implementationTime: '22:00',
      duration: '4 hours',
      status: 'Scheduled',
      affectedSystems: ['ERP System', 'Database Server', 'Application Server'],
      downtime: true,
      backupCompleted: true,
      stakeholdersNotified: true,
      changeWindow: 'Weekend - 10:00 PM to 2:00 AM',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-10-20',
      rollbackPlan: true
    },
    {
      id: '2',
      ticketNumber: 'CHG-2024-1238',
      title: 'Network Switch Replacement - Building A',
      type: 'Normal',
      category: 'Infrastructure',
      priority: 'P2',
      implementer: 'Michael Zhang',
      implementationDate: '2024-10-26',
      implementationTime: '08:00',
      duration: '2 hours',
      status: 'Ready',
      affectedSystems: ['Network Core Switch', 'Access Points'],
      downtime: true,
      backupCompleted: true,
      stakeholdersNotified: true,
      changeWindow: 'Weekend - 8:00 AM to 10:00 AM',
      approvedBy: 'Tom Wilson',
      approvalDate: '2024-10-18',
      rollbackPlan: true
    },
    {
      id: '3',
      ticketNumber: 'CHG-2024-1242',
      title: 'Database Index Optimization',
      type: 'Standard',
      category: 'Database',
      priority: 'P3',
      implementer: 'Robert Brown',
      implementationDate: '2024-10-22',
      implementationTime: '02:00',
      duration: '1 hour',
      status: 'In Progress',
      affectedSystems: ['Production Database'],
      downtime: false,
      backupCompleted: true,
      stakeholdersNotified: false,
      changeWindow: 'Maintenance Window - 2:00 AM to 3:00 AM',
      approvedBy: 'Lisa Chen',
      approvalDate: '2024-10-19',
      rollbackPlan: true
    },
    {
      id: '4',
      ticketNumber: 'CHG-2024-1243',
      title: 'Firewall Configuration Update',
      type: 'Normal',
      category: 'Security',
      priority: 'P2',
      implementer: 'Emily Davis',
      implementationDate: '2024-10-25',
      implementationTime: '20:00',
      duration: '30 minutes',
      status: 'Scheduled',
      affectedSystems: ['Perimeter Firewall', 'Internal Firewall'],
      downtime: false,
      backupCompleted: true,
      stakeholdersNotified: true,
      changeWindow: 'Evening - 8:00 PM to 8:30 PM',
      approvedBy: 'Tom Wilson',
      approvalDate: '2024-10-19',
      rollbackPlan: true
    },
    {
      id: '5',
      ticketNumber: 'CHG-2024-1241',
      title: 'Email Server Configuration Update',
      type: 'Normal',
      category: 'Infrastructure',
      priority: 'P2',
      implementer: 'James Wilson',
      implementationDate: '2024-10-24',
      implementationTime: '23:00',
      duration: '2 hours',
      status: 'Scheduled',
      affectedSystems: ['Email Server', 'Exchange Server'],
      downtime: true,
      backupCompleted: true,
      stakeholdersNotified: true,
      changeWindow: 'Night - 11:00 PM to 1:00 AM',
      approvedBy: 'David Kumar',
      approvalDate: '2024-10-17',
      rollbackPlan: true
    },
    {
      id: '6',
      ticketNumber: 'CHG-2024-1244',
      title: 'CRM Module Customization Deployment',
      type: 'Normal',
      category: 'Application',
      priority: 'P3',
      implementer: 'Linda Martinez',
      implementationDate: '2024-10-27',
      implementationTime: '14:00',
      duration: '1.5 hours',
      status: 'Scheduled',
      affectedSystems: ['CRM System'],
      downtime: false,
      backupCompleted: false,
      stakeholdersNotified: true,
      changeWindow: 'Business Hours - 2:00 PM to 3:30 PM',
      approvedBy: 'Mike Chen',
      approvalDate: '2024-10-20',
      rollbackPlan: true
    }
  ]

  const [scheduledChanges, setScheduledChanges] = useState<ScheduledChange[]>(seedScheduledChanges)

  useEffect(() => {
    let cancelled = false
    SupportScheduledChangeService.getChanges()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setScheduledChanges(rows as unknown as ScheduledChange[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Statistics
  const stats = {
    totalScheduled: scheduledChanges.length,
    thisWeek: scheduledChanges.filter(c => {
      const changeDate = new Date(c.implementationDate)
      const weekStart = new Date()
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() + 7)
      return changeDate >= weekStart && changeDate <= weekEnd
    }).length,
    inProgress: scheduledChanges.filter(c => c.status === 'In Progress').length,
    requiresDowntime: scheduledChanges.filter(c => c.downtime).length
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay }
  }

  const getChangesForDate = (date: Date) => {
    return scheduledChanges.filter(change => {
      const changeDate = new Date(change.implementationDate)
      return changeDate.toDateString() === date.toDateString()
    })
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-700 border-red-200'
      case 'P1': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'P2': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'P3': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700'
      case 'In Progress': return 'bg-green-100 text-green-700'
      case 'On Hold': return 'bg-yellow-100 text-yellow-700'
      case 'Ready': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Changes</h1>
          <p className="text-gray-600 mt-1">Approved changes scheduled for implementation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-4 py-2 rounded-lg ${
              selectedView === 'calendar' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setSelectedView('list')}
            className={`px-4 py-2 rounded-lg ${
              selectedView === 'list' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-2">
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
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold mt-1">{stats.thisWeek}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <Play className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requires Downtime</p>
              <p className="text-2xl font-bold mt-1">{stats.requiresDowntime}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border p-3">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Previous</span>
              </button>
              <button
                onClick={nextMonth}
                className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                <span className="text-gray-700">Next</span>
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const changesForDay = getChangesForDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square border rounded-lg p-2 cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'border-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {day}
                  </div>
                  {changesForDay.length > 0 && (
                    <div className="space-y-1">
                      {changesForDay.slice(0, 2).map(change => (
                        <div
                          key={change.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(change.status)}`}
                          title={change.title}
                        >
                          {change.implementationTime} - {change.title.substring(0, 15)}...
                        </div>
                      ))}
                      {changesForDay.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{changesForDay.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && getChangesForDate(selectedDate).length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-semibold mb-2">
                Changes on {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="space-y-3">
                {getChangesForDate(selectedDate).map(change => (
                  <div key={change.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{change.ticketNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(change.status)}`}>
                            {change.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(change.priority)}`}>
                            {change.priority}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{change.title}</p>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {change.implementationTime} ({change.duration})
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {change.implementer}
                          </span>
                          {change.downtime && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              Downtime
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedChange(change)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {selectedView === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Ticket</th>
                  <th className="text-left p-3 font-medium text-gray-600">Title</th>
                  <th className="text-left p-3 font-medium text-gray-600">Date & Time</th>
                  <th className="text-left p-3 font-medium text-gray-600">Duration</th>
                  <th className="text-left p-3 font-medium text-gray-600">Implementer</th>
                  <th className="text-left p-3 font-medium text-gray-600">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600">Downtime</th>
                  <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scheduledChanges
                  .sort((a, b) => new Date(a.implementationDate).getTime() - new Date(b.implementationDate).getTime())
                  .map((change) => (
                    <tr key={change.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{change.ticketNumber}</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs border mt-1 ${getPriorityColor(change.priority)}`}>
                          {change.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{change.title}</div>
                        <div className="text-xs text-gray-500">{change.category}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {new Date(change.implementationDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">{change.implementationTime}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{change.duration}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{change.implementer}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                          {change.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {change.downtime ? (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedChange(change)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedChange.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedChange.ticketNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedChange(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Implementation Date</p>
                  <p className="font-medium mt-1">
                    {new Date(selectedChange.implementationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Implementation Time</p>
                  <p className="font-medium mt-1">{selectedChange.implementationTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium mt-1">{selectedChange.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(selectedChange.status)}`}>
                    {selectedChange.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Implementer</p>
                  <p className="font-medium mt-1">{selectedChange.implementer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved By</p>
                  <p className="font-medium mt-1">{selectedChange.approvedBy}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Affected Systems</p>
                <div className="flex flex-wrap gap-2">
                  {selectedChange.affectedSystems.map((system, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {selectedChange.backupCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm">Backup Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChange.stakeholdersNotified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm">Stakeholders Notified</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChange.rollbackPlan ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm">Rollback Plan</span>
                </div>
              </div>

              {selectedChange.status === 'Scheduled' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Implementation
                  </button>
                  <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2">
                    <Pause className="h-4 w-4" />
                    Put On Hold
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
