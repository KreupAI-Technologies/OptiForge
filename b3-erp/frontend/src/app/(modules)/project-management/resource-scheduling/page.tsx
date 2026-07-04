'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Config: chart color/axis config for allocation pie — kept hardcoded (color map)
const projectAllocationData = [
  { name: 'Project A', value: 35, color: '#3b82f6' },
  { name: 'Project B', value: 25, color: '#10b981' },
  { name: 'Project C', value: 20, color: '#f59e0b' },
  { name: 'Other', value: 20, color: '#6b7280' },
];

interface UtilizationRow {
  name: string;
  allocated: number;
  available: number;
}

interface ConflictRow {
  id: number | string;
  resource: string;
  conflict: string;
  severity: string;
}

export default function ResourceSchedulingDashboard() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [utilizationData, setUtilizationData] = useState<UtilizationRow[]>([]);
  const [recentConflicts, setRecentConflicts] = useState<ConflictRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [rawAllocations, rawUtilization] = await Promise.all([
          projectManagementService.getPmResourceAllocations(),
          projectManagementService.getPmResourceUtilization(),
        ]);
        const conflicts: ConflictRow[] = (rawAllocations || []).map((r: any, idx: number) => ({
          id: r.id ?? r.allocationId ?? idx + 1,
          resource: r.resource ?? r.resourceName ?? r.name ?? r.employeeName ?? '',
          conflict: r.conflict ?? r.conflictDescription ?? r.description ?? r.notes ?? '',
          severity: r.severity ?? r.priority ?? r.level ?? 'Low',
        }));
        const utilization: UtilizationRow[] = (rawUtilization || []).map((r: any) => {
          const allocated = Number(r.allocated ?? r.utilization ?? r.allocatedPercent ?? r.utilizationRate ?? 0);
          return {
            name: r.name ?? r.department ?? r.resourceType ?? r.team ?? '',
            allocated,
            available: Number(r.available ?? r.availablePercent ?? (100 - allocated)),
          };
        });
        if (!cancelled) {
          setRecentConflicts(conflicts);
          setUtilizationData(utilization);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setRecentConflicts([]);
          setUtilizationData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className=" px-3 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resource Scheduling</h1>
              <p className="text-sm text-gray-500">Manage allocations, schedules, and capacity planning</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => router.push('/project-management/resource-scheduling/requests')}>
                Resource Requests
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/project-management/resource-scheduling/allocation')}>
                <Plus className="h-4 w-4 mr-2" />
                Allocate Resource
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-6 border-b border-gray-100">
            <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
              Dashboard
            </button>
            <button
              onClick={() => router.push('/project-management/resource-scheduling/calendar')}
              className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Master Schedule
            </button>
            <button
              onClick={() => router.push('/project-management/resource-scheduling/allocation')}
              className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Allocation Matrix
            </button>
            <button
              onClick={() => router.push('/project-management/resource-scheduling/conflicts')}
              className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Conflicts
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
        <div className=" space-y-3">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Resources</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">142</h3>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      128 Active
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Utilization</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">82%</h3>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5% vs last week
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ActivityIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Conflicts</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">3</h3>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Action required
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">8</h3>
                    <p className="text-xs text-yellow-600 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      2 Urgent
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Utilization Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Resource Utilization by Department</CardTitle>
                <CardDescription>Allocated vs Available capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading utilization…</div>
                  ) : loadError ? (
                    <div className="flex items-center justify-center h-full text-sm text-red-600">{loadError}</div>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="allocated" name="Allocated %" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="available" name="Available %" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Allocation Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Allocation by Project</CardTitle>
                <CardDescription>Resource distribution across active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {projectAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recent Conflicts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Conflicts</CardTitle>
                  <CardDescription>Issues requiring immediate attention</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/project-management/resource-scheduling/conflicts')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="p-3 text-sm text-gray-500">Loading conflicts…</div>
                  ) : loadError ? (
                    <div className="p-3 text-sm text-red-600">{loadError}</div>
                  ) : recentConflicts.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No conflicts to display.</div>
                  ) : recentConflicts.map((conflict) => (
                    <div key={conflict.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{conflict.resource}</p>
                          <p className="text-sm text-red-700">{conflict.conflict}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${conflict.severity === 'High' ? 'bg-red-200 text-red-800' :
                          conflict.severity === 'Medium' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                        }`}>
                        {conflict.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Allocations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Allocations</CardTitle>
                  <CardDescription>Scheduled to start this week</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/project-management/resource-scheduling/calendar')}>
                  View Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          RK
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Rajesh Kumar</p>
                          <p className="text-sm text-gray-500">Project Manager • Project A</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Starts Tomorrow</p>
                        <p className="text-xs text-gray-500">Full Time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
