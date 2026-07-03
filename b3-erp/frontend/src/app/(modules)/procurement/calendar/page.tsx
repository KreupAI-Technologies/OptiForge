'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight, Package, Truck, FileText,
  Clock, AlertCircle, CheckCircle, MapPin, User, Filter, Plus,
  Search, Download, Settings, List, Grid, Info, X, Edit, Trash2,
  Bell, ArrowRight, Tag, Building2, CalendarDays, Eye
} from 'lucide-react'
import { procurementCalendarService } from '@/services/procurement-calendar.service'

type CalendarEventView = {
  id: string
  title: string
  type: string
  date: Date
  time?: string
  vendor?: string
  description?: string
  location?: string
  items?: number
  value?: number
  status?: string
  priority?: string
}

// Known event-type styles; anything else falls back to a neutral style.
const KNOWN_TYPES = ['delivery', 'rfq', 'contract', 'meeting', 'inspection', 'payment']

export default function ProcurementCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [filterType, setFilterType] = useState('all')
  const [events, setEvents] = useState<CalendarEventView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const rows = await procurementCalendarService.getEvents()
        if (!active) return
        setEvents(
          (rows || []).map((r) => ({
            id: r.id,
            title: r.title,
            type: KNOWN_TYPES.includes((r.type || '').toLowerCase())
              ? (r.type || '').toLowerCase()
              : 'meeting',
            date: r.eventDate ? new Date(r.eventDate) : new Date(),
            time: r.time,
            vendor: r.vendor,
            description: r.description,
            location: r.location,
            items: r.items != null ? Number(r.items) : undefined,
            value: r.value != null ? Number(r.value) : undefined,
            status: r.status,
            priority: r.priority,
          })),
        )
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load events')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const eventTypes = {
    delivery: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
    rfq: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FileText },
    contract: { color: 'bg-green-100 text-green-700 border-green-200', icon: FileText },
    meeting: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: User },
    inspection: { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: CheckCircle },
    payment: { color: 'bg-red-100 text-red-700 border-red-200', icon: Clock },
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      })
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear() &&
      (filterType === 'all' || event.type === filterType)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const days = getDaysInMonth(currentMonth)

  const upcomingEvents = events
    .filter(e => e.date >= new Date() && (filterType === 'all' || e.type === filterType))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  const EventModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {selectedEvent ? 'Event Details' : 'Add New Event'}
            </h3>
            <button
              onClick={() => {
                setShowEventModal(false)
                setSelectedEvent(null)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {selectedEvent ? (
          <div className="p-6">
            <div className="mb-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                eventTypes[selectedEvent.type as keyof typeof eventTypes].color
              }`}>
                {React.createElement(eventTypes[selectedEvent.type as keyof typeof eventTypes].icon, {
                  className: 'h-4 w-4'
                })}
                {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">{selectedEvent.title}</h2>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Date & Time</label>
                  <p className="font-medium">
                    {selectedEvent.date.toLocaleDateString()} at {selectedEvent.time}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="font-medium capitalize">{selectedEvent.status}</p>
                </div>
              </div>

              {selectedEvent.vendor && (
                <div>
                  <label className="text-sm text-gray-500">Vendor</label>
                  <p className="font-medium">{selectedEvent.vendor}</p>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </p>
                </div>
              )}

              {selectedEvent.value && (
                <div>
                  <label className="text-sm text-gray-500">Value</label>
                  <p className="font-medium text-lg">${selectedEvent.value.toLocaleString()}</p>
                </div>
              )}

              {selectedEvent.items && (
                <div>
                  <label className="text-sm text-gray-500">Items</label>
                  <p className="font-medium">{selectedEvent.items} items</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                  selectedEvent.priority === 'high' ? 'bg-red-100 text-red-700' :
                  selectedEvent.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {selectedEvent.priority}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Event
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <form className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="delivery">Delivery</option>
                    <option value="rfq">RFQ Deadline</option>
                    <option value="contract">Contract</option>
                    <option value="meeting">Meeting</option>
                    <option value="inspection">Inspection</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement Calendar</h1>
            <p className="text-gray-600 mt-1">Track deliveries, deadlines, and procurement events</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Settings</span>
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Download</span>
            </button>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </div>

        {/* View Mode and Filters */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {(['month', 'week', 'day', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode === 'list' ? <List className="h-4 w-4" /> : mode}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="delivery">Deliveries</option>
              <option value="rfq">RFQ Deadlines</option>
              <option value="contract">Contracts</option>
              <option value="meeting">Meetings</option>
              <option value="inspection">Inspections</option>
              <option value="payment">Payments</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Calendar Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">{monthYear}</h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const dayEvents = getEventsForDate(day.fullDate)
                  const isToday =
                    day.fullDate.toDateString() === new Date().toDateString() &&
                    day.isCurrentMonth

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day.fullDate)}
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                        day.isCurrentMonth
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50 text-gray-400'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                        selectedDate?.toDateString() === day.fullDate.toDateString()
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                          {day.date}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, eventIdx) => (
                          <div
                            key={eventIdx}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                            className={`text-xs p-1 rounded truncate border ${
                              eventTypes[event.type as keyof typeof eventTypes].color
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Today's Events */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Today's Schedule
            </h3>
            <div className="space-y-3">
              {getEventsForDate(new Date()).length > 0 ? (
                getEventsForDate(new Date()).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEventModal(true)
                    }}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{event.title}</span>
                      <span className="text-xs text-gray-500">{event.time}</span>
                    </div>
                    {event.vendor && (
                      <div className="text-xs text-gray-600">{event.vendor}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No events scheduled for today</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowEventModal(true)
                  }}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <div className={`p-2 rounded-lg ${
                    eventTypes[event.type as keyof typeof eventTypes].color
                  }`}>
                    {React.createElement(eventTypes[event.type as keyof typeof eventTypes].icon, {
                      className: 'h-4 w-4'
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {event.date.toLocaleDateString()} at {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Legend */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-lg font-semibold mb-2">Event Types</h3>
            <div className="space-y-2">
              {Object.entries(eventTypes).map(([type, config]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${config.color}`}>
                    {React.createElement(config.icon, { className: 'h-3 w-3' })}
                  </div>
                  <span className="text-sm capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && <EventModal />}
    </div>
  )
}