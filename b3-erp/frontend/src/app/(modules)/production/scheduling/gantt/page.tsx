'use client';

import { useState } from 'react';
import { exportToCsv } from '@/lib/export';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Package,
  Clock,
  Users
} from 'lucide-react';

interface GanttTask {
  id: string;
  workOrderNumber: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  station: string;
  team: string;
  dependencies: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

export default function GanttChartPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date('2025-10-20'));

  const tasks: GanttTask[] = [
    {
      id: '1',
      workOrderNumber: 'WO-2025-1142',
      productName: 'Premium SS304 Kitchen Sink - Double Bowl',
      category: 'Kitchen Sinks',
      quantity: 25,
      unit: 'PC',
      startDate: '2025-10-12',
      endDate: '2025-10-24',
      duration: 12,
      progress: 68,
      station: 'Polishing & Finishing',
      team: 'Team A - Sinks',
      dependencies: [],
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '2',
      workOrderNumber: 'WO-2025-1143',
      productName: 'Auto-Clean Kitchen Chimney - 90cm',
      category: 'Kitchen Appliances',
      quantity: 15,
      unit: 'PC',
      startDate: '2025-10-10',
      endDate: '2025-10-23',
      duration: 13,
      progress: 62,
      station: 'Motor Assembly',
      team: 'Team C - Appliances',
      dependencies: [],
      status: 'in-progress',
      priority: 'urgent'
    },
    {
      id: '3',
      workOrderNumber: 'WO-2025-1144',
      productName: 'Modular Base Cabinet - 3 Drawer',
      category: 'Kitchen Cabinets',
      quantity: 40,
      unit: 'PC',
      startDate: '2025-10-17',
      endDate: '2025-11-06',
      duration: 20,
      progress: 0,
      station: 'Panel Cutting',
      team: 'Team B - Cabinets',
      dependencies: [],
      status: 'not-started',
      priority: 'high'
    },
    {
      id: '4',
      workOrderNumber: 'WO-2025-1145',
      productName: 'Chrome Finish Kitchen Faucet - Single Lever',
      category: 'Kitchen Faucets',
      quantity: 60,
      unit: 'PC',
      startDate: '2025-10-21',
      endDate: '2025-11-02',
      duration: 12,
      progress: 0,
      station: 'Body Machining',
      team: 'Team D - Faucets',
      dependencies: [],
      status: 'not-started',
      priority: 'medium'
    },
    {
      id: '5',
      workOrderNumber: 'WO-2025-1135',
      productName: 'Professional Cookware Set - 7 Piece',
      category: 'Cookware',
      quantity: 50,
      unit: 'SET',
      startDate: '2025-10-11',
      endDate: '2025-10-27',
      duration: 16,
      progress: 71,
      station: 'Non-Stick Coating',
      team: 'Team E - Cookware',
      dependencies: [],
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '6',
      workOrderNumber: 'WO-2025-1136',
      productName: 'Granite Countertop - Premium Black Galaxy',
      category: 'Countertops',
      quantity: 20,
      unit: 'PC',
      startDate: '2025-10-09',
      endDate: '2025-10-25',
      duration: 16,
      progress: 42,
      station: 'Edge Polishing',
      team: 'Team F - Stone Work',
      dependencies: [],
      status: 'in-progress',
      priority: 'urgent'
    },
    {
      id: '7',
      workOrderNumber: 'WO-2025-1137',
      productName: 'Modular Kitchen Organizer Set - Premium',
      category: 'Kitchen Accessories',
      quantity: 80,
      unit: 'SET',
      startDate: '2025-10-13',
      endDate: '2025-10-25',
      duration: 12,
      progress: 82,
      station: 'Packaging',
      team: 'Team G - Accessories',
      dependencies: [],
      status: 'in-progress',
      priority: 'low'
    },
    {
      id: '8',
      workOrderNumber: 'WO-2025-1138',
      productName: 'Undermount SS Sink - Single Bowl Large',
      category: 'Kitchen Sinks',
      quantity: 35,
      unit: 'PC',
      startDate: '2025-10-07',
      endDate: '2025-10-22',
      duration: 15,
      progress: 48,
      station: 'Welding',
      team: 'Team A - Sinks',
      dependencies: [],
      status: 'delayed',
      priority: 'high'
    },
    {
      id: '9',
      workOrderNumber: 'WO-2025-1146',
      productName: 'Built-in Microwave Oven - 30L',
      category: 'Kitchen Appliances',
      quantity: 18,
      unit: 'PC',
      startDate: '2025-10-23',
      endDate: '2025-11-07',
      duration: 15,
      progress: 0,
      station: 'Assembly',
      team: 'Team C - Appliances',
      dependencies: ['2'],
      status: 'not-started',
      priority: 'medium'
    },
    {
      id: '10',
      workOrderNumber: 'WO-2025-1147',
      productName: 'Granite Composite Sink - Single Bowl',
      category: 'Kitchen Sinks',
      quantity: 22,
      unit: 'PC',
      startDate: '2025-10-24',
      endDate: '2025-11-10',
      duration: 17,
      progress: 0,
      station: 'Molding',
      team: 'Team A - Sinks',
      dependencies: ['1'],
      status: 'not-started',
      priority: 'medium'
    }
  ];

  const stations = ['all', ...Array.from(new Set(tasks.map(t => t.station)))];

  const filteredTasks = filterStation === 'all'
    ? tasks
    : tasks.filter(t => t.station === filterStation);

  // Generate timeline dates
  const generateTimeline = () => {
    const dates: Date[] = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 7);

    const daysToShow = viewMode === 'day' ? 14 : viewMode === 'week' ? 42 : 90;

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const timeline = generateTimeline();

  const getTaskPosition = (task: GanttTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const timelineStart = timeline[0];
    const timelineEnd = timeline[timeline.length - 1];

    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-gray-400',
      'in-progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'delayed': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'border-l-4 border-red-500',
      high: 'border-l-4 border-orange-500',
      medium: 'border-l-4 border-blue-500',
      low: 'border-l-4 border-gray-400'
    };
    return colors[priority as keyof typeof colors] || '';
  };

  const formatDate = (date: Date) => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (viewMode === 'week') {
      return `W${Math.ceil(date.getDate() / 7)}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = viewMode === 'day' ? 7 : viewMode === 'week' ? 21 : 30;
    newDate.setDate(newDate.getDate() + (direction === 'next' ? offset : -offset));
    setCurrentDate(newDate);
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleExport = () => {
    exportToCsv('gantt-schedule', filteredTasks as unknown as Record<string, unknown>[]);
  };

  // Summary stats
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const delayed = tasks.filter(t => t.status === 'delayed').length;
  const avgProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks;

  return (
    <div className="w-full px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Gantt Chart</h1>
            <p className="text-sm text-gray-600">Visual timeline of work order schedules</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullScreen}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Maximize2 className="h-4 w-4" />
            Full Screen
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Tasks</span>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalTasks}</div>
          <div className="text-xs text-blue-700 mt-1">Scheduled</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">In Progress</span>
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{inProgress}</div>
          <div className="text-xs text-green-700 mt-1">Active now</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900">Delayed</span>
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{delayed}</div>
          <div className="text-xs text-red-700 mt-1">Need attention</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Avg Progress</span>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{avgProgress.toFixed(0)}%</div>
          <div className="text-xs text-purple-700 mt-1">Overall</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stations.map(station => (
                <option key={station} value={station}>
                  {station === 'all' ? 'All Stations' : station}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-4">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Timeline Header */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-64 p-3 font-medium text-sm text-gray-700 border-r border-gray-200">
                Work Order / Product
              </div>
              <div className="flex-1 flex">
                {timeline.filter((_, idx) => viewMode === 'day' || idx % (viewMode === 'week' ? 7 : 30) === 0).map((date, idx) => (
                  <div
                    key={idx}
                    className="flex-1 p-2 text-center text-xs text-gray-600 border-r border-gray-200"
                  >
                    {formatDate(date)}
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="relative">
              {filteredTasks.map((task, taskIdx) => (
                <div
                  key={task.id}
                  className={`flex border-b border-gray-100 hover:bg-gray-50 ${getPriorityColor(task.priority)}`}
                >
                  {/* Task Info */}
                  <div className="w-64 p-3 border-r border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-1">{task.workOrderNumber}</div>
                    <div className="text-xs text-gray-600 mb-1">{task.productName}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{task.quantity} {task.unit}</span>
                      <span>•</span>
                      <span>{task.team}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative h-16 p-2">
                    <div
                      className={`absolute h-8 rounded ${getStatusColor(task.status)} opacity-90 hover:opacity-100 transition-opacity cursor-pointer`}
                      style={getTaskPosition(task)}
                      title={`${task.productName} (${task.progress}%)`}
                    >
                      {/* Progress bar inside */}
                      <div
                        className="h-full bg-white bg-opacity-30 rounded-l"
                        style={{ width: `${task.progress}%` }}
                      ></div>

                      {/* Task label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white px-2 truncate">
                          {task.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Today indicator */}
                    {taskIdx === 0 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: '50%' }}
                      >
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                          Today
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span className="text-sm text-gray-600">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">Delayed</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-sm text-gray-600">Urgent Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-orange-500"></div>
            <span className="text-sm text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span className="text-sm text-gray-600">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-gray-400"></div>
            <span className="text-sm text-gray-600">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredTasks.length} of {totalTasks} tasks • Red line indicates today
      </div>
    </div>
  );
}
