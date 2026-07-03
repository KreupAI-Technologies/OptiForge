'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Phone, Mail, CheckSquare, Clock, MapPin } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'task' | 'email';
  start: string;
  end: string;
  attendees?: string[];
  location?: string;
  description: string;
  color: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const normalizeType = (t: string): CalendarEvent['type'] => {
      const v = (t ?? '').toLowerCase();
      if (v === 'meeting' || v === 'call' || v === 'email' || v === 'task') return v;
      return 'task';
    };

    const colorForType = (t: CalendarEvent['type']): string => {
      switch (t) {
        case 'meeting':
          return 'purple';
        case 'call':
          return 'green';
        case 'email':
          return 'orange';
        default:
          return 'blue';
      }
    };

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await crmService.activities.getAll()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: CalendarEvent[] = list.map((a) => {
          const type = normalizeType(a?.type);
          const start = a?.startDate ?? a?.dueDate ?? a?.createdAt ?? '';
          const end = a?.endDate ?? start;
          return {
            id: String(a?.id ?? ''),
            title: a?.subject ?? '',
            type,
            start,
            end,
            attendees: a?.assignedToName ? [a.assignedToName] : [],
            location: a?.location ?? undefined,
            description: a?.description ?? '',
            color: colorForType(type),
          };
        });
        if (!cancelled) setEvents(mapped);
      } catch (err) {
        if (!cancelled) setLoadError('Failed to load calendar events. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const days = [];
    const currentDay = new Date(date);
    currentDay.setDate(currentDay.getDate() - currentDay.getDay());

    for (let i = 0; i < 7; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'call':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'task':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'email':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="w-3 h-3" />;
      case 'call':
        return <Phone className="w-3 h-3" />;
      case 'task':
        return <CheckSquare className="w-3 h-3" />;
      case 'email':
        return <Mail className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const monthDays = getDaysInMonth(currentDate);
  const weekDays = getWeekDays(currentDate);

  const upcomingEvents = events
    .filter(e => new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      <div className="mb-8">
        {/* View Toggle & Navigation */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
            >
              Month
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(currentDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(currentDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {view === 'week' && (
              <div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-700 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={index}
                        className={`min-h-[150px] border border-gray-200 rounded-lg p-2 ${
                          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border ${getEventColor(event.type)}`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {getEventIcon(event.type)}
                                <span className="font-medium truncate">{new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                              </div>
                              <div className="truncate">{event.title}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'month' && (
              <div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-700 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="min-h-[100px] bg-gray-50 rounded-lg"></div>;
                    }
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] border border-gray-200 rounded-lg p-2 ${
                          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Upcoming Events</h2>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className={`border-l-4 pl-3 py-2 ${getEventColor(event.type)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {getEventIcon(event.type)}
                    <span className="text-xs font-medium">{event.type}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.start).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
