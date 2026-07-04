'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

// Mock Data
const resources = [
  { id: 1, name: 'Rajesh Kumar', role: 'Project Manager', department: 'Management' },
  { id: 2, name: 'Suresh Patel', role: 'Installation Lead', department: 'Installation' },
  { id: 3, name: 'Amit Singh', role: 'Electrical Eng.', department: 'Engineering' },
  { id: 4, name: 'Priya Sharma', role: 'Quality Inspector', department: 'Quality' },
  { id: 5, name: 'Team Alpha', role: 'Assembly Crew', department: 'Production' },
];

interface Allocation {
  id: number;
  resourceId: number;
  project: string;
  start: number;
  duration: number;
  color: string;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = Array.from({ length: 14 }, (_, i) => i + 1); // Mock 2 weeks

export default function MasterSchedulePage() {
  const router = useRouter();
  const [view, setView] = useState('2-weeks');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.getPmResourceAllocations();
        const mapped: Allocation[] = (raw || []).map((r: any, i: number) => ({
          id: r.id ?? i + 1,
          resourceId: r.resourceId ?? r.resource_id ?? r.resource?.id ?? 0,
          project: r.project ?? r.projectName ?? r.project_name ?? '',
          start: r.start ?? r.startDay ?? 1,
          duration: r.duration ?? r.durationDays ?? 1,
          color: r.color ?? 'bg-blue-500',
        }));
        if (!cancelled) setAllocations(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setAllocations([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className=" px-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Master Schedule</h1>
                <p className="text-sm text-gray-500">Timeline view of all resource allocations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="bg-white shadow-sm">Day</Button>
                <Button variant="ghost" size="sm">Week</Button>
                <Button variant="ghost" size="sm">Month</Button>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Allocation
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mt-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-900">June 2024</span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart Area */}
      <div className="flex-1 overflow-auto p-3 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-sm text-gray-500 mb-3">Loading allocations…</div>
        )}
        {loadError && (
          <div className="text-sm text-red-600 mb-3">{loadError}</div>
        )}
        <div className=" bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Timeline Header */}
          <div className="grid grid-cols-[250px_1fr] border-b border-gray-200">
            <div className="p-4 border-r border-gray-200 bg-gray-50 font-medium text-gray-500 text-sm">
              Resource
            </div>
            <div className="grid grid-cols-14 divide-x divide-gray-100">
              {dates.map((date, i) => (
                <div key={i} className="text-center py-2 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">{days[i % 7]}</div>
                  <div className="text-sm font-medium text-gray-900">{date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Rows */}
          <div className="divide-y divide-gray-200">
            {resources.map((resource) => (
              <div key={resource.id} className="grid grid-cols-[250px_1fr] group hover:bg-gray-50">
                <div className="p-4 border-r border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{resource.name}</p>
                    <p className="text-xs text-gray-500">{resource.role}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <div className="relative grid grid-cols-14 divide-x divide-gray-100 h-16">
                  {/* Grid Lines */}
                  {dates.map((_, i) => (
                    <div key={i} className="h-full"></div>
                  ))}

                  {/* Allocation Bars */}
                  {allocations
                    .filter(a => a.resourceId === resource.id)
                    .map((alloc) => (
                      <div
                        key={alloc.id}
                        className={`absolute top-2 bottom-2 rounded-md ${alloc.color} opacity-90 hover:opacity-100 cursor-pointer flex items-center px-2 shadow-sm transition-all`}
                        style={{
                          left: `${(alloc.start - 1) * (100 / 14)}%`,
                          width: `${alloc.duration * (100 / 14)}%`,
                          marginLeft: '2px',
                          marginRight: '2px',
                        }}
                      >
                        <span className="text-xs text-white font-medium truncate">
                          {alloc.project}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
