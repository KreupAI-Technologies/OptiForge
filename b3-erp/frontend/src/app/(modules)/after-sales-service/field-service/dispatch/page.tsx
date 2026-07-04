'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  User,
  Clock,
  Navigation,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';

interface FieldJob {
  id: string;
  jobNumber: string;
  customerName: string;
  address: string;
  jobType: 'Service Request' | 'Installation' | 'Preventive Maintenance';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  scheduledTime: string;
  duration: number;
  status: 'Assigned' | 'Dispatched' | 'In Transit' | 'On Site' | 'Completed';
  engineer: string;
  engineerStatus: 'Available' | 'On Job' | 'In Transit' | 'Break';
  distance: number;
  estimatedArrival: string;
}

export default function FieldServiceDispatchPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEngineer, setSelectedEngineer] = useState('All');

  // Field jobs loaded from the after-sales field-service endpoint.
  const [fieldJobs, setFieldJobs] = useState<FieldJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.fieldJobs()) as any[];
        const mapped: FieldJob[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          jobNumber: r?.jobNumber ?? r?.jobNo ?? '',
          customerName: r?.customerName ?? r?.customer ?? '',
          address: r?.address ?? r?.serviceAddress ?? '',
          jobType: (r?.jobType ?? 'Service Request') as FieldJob['jobType'],
          priority: (r?.priority ?? 'P3') as FieldJob['priority'],
          scheduledTime: r?.scheduledTime ?? '',
          duration: Number(r?.duration ?? r?.estimatedDuration ?? 0) || 0,
          status: (r?.status ?? 'Assigned') as FieldJob['status'],
          engineer: r?.engineer ?? r?.assignedTo ?? r?.engineerName ?? '',
          engineerStatus: (r?.engineerStatus ?? 'Available') as FieldJob['engineerStatus'],
          distance: Number(r?.distance ?? 0) || 0,
          estimatedArrival: r?.estimatedArrival ?? '',
        }));
        if (!cancelled) setFieldJobs(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load field jobs');
          setFieldJobs([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const engineers = ['All', ...Array.from(new Set(fieldJobs.map(j => j.engineer)))];

  const filteredJobs = fieldJobs.filter(job => {
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus;
    const matchesEngineer = selectedEngineer === 'All' || job.engineer === selectedEngineer;
    return matchesStatus && matchesEngineer;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return 'bg-gray-100 text-gray-700';
      case 'Dispatched': return 'bg-blue-100 text-blue-700';
      case 'In Transit': return 'bg-purple-100 text-purple-700';
      case 'On Site': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-700';
      case 'P2': return 'bg-orange-100 text-orange-700';
      case 'P3': return 'bg-yellow-100 text-yellow-700';
      case 'P4': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEngineerStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'On Job': return 'bg-yellow-100 text-yellow-700';
      case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Break': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Statistics
  const stats = {
    totalJobs: fieldJobs.length,
    dispatched: fieldJobs.filter(j => j.status === 'Dispatched' || j.status === 'In Transit').length,
    onSite: fieldJobs.filter(j => j.status === 'On Site').length,
    completed: fieldJobs.filter(j => j.status === 'Completed').length,
    engineersActive: Array.from(new Set(fieldJobs.filter(j => j.engineerStatus !== 'Available').map(j => j.engineer))).length
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Service Dispatch Board</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time field operations monitoring and dispatch</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Jobs</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalJobs}</div>
          <div className="text-xs text-gray-500 mt-1">Today</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Dispatched</span>
            <Navigation className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.dispatched}</div>
          <div className="text-xs text-gray-500 mt-1">En route</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">On Site</span>
            <MapPin className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.onSite}</div>
          <div className="text-xs text-gray-500 mt-1">In progress</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completed</span>
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-500 mt-1">Today</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Engineers Active</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.engineersActive}</div>
          <div className="text-xs text-gray-500 mt-1">Out of {engineers.length - 1}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Assigned">Assigned</option>
            <option value="Dispatched">Dispatched</option>
            <option value="In Transit">In Transit</option>
            <option value="On Site">On Site</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={selectedEngineer}
            onChange={(e) => setSelectedEngineer(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {engineers.map(eng => (
              <option key={eng} value={eng}>{eng}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{job.jobNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{job.jobType}</div>
              </div>
              <button
                onClick={() => router.push(`/after-sales-service/field-service/view/${job.id}`)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{job.customerName}</div>
                  <div className="text-xs text-gray-600">{job.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900">{job.engineer}</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${getEngineerStatusColor(job.engineerStatus)}`}>
                  {job.engineerStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{job.scheduledTime}</span>
                  <span className="text-gray-500">({job.duration}h)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              {job.distance > 0 ? (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Navigation className="w-3 h-3" />
                  <span>{job.distance} km • ETA {job.estimatedArrival}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-600">{job.estimatedArrival}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
