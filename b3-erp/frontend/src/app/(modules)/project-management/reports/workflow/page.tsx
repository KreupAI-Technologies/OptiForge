'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowLeft,
  Calendar,
  Filter,
  Download,
  Share2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Factory,
  Users,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalWrapper } from '@/components/ui/ModalWrapper';

// Drill-down Mock Data
const stageDetails = {
  'Design': [
    { id: 'JOB-101', product: 'Custom Kitchen Island', status: 'In Review', due: '2024-06-10' },
    { id: 'JOB-105', product: 'Office Cabinetry', status: 'Drafting', due: '2024-06-12' },
  ],
  'Engineering': [
    { id: 'JOB-102', product: 'Steel Frame Structure', status: 'Structural Analysis', due: '2024-06-08' },
  ],
  'Production': [
    { id: 'JOB-098', product: 'Industrial Workbench', status: 'Cutting', due: '2024-06-05' },
    { id: 'JOB-099', product: 'Storage Rack System', status: 'Welding', due: '2024-06-06' },
    { id: 'JOB-100', product: 'Conveyor Belt Unit', status: 'Assembly', due: '2024-06-07' },
  ],
  'Assembly': [
    { id: 'JOB-095', product: 'Modular Office Pod', status: 'Final Assembly', due: '2024-06-04' },
    { id: 'JOB-096', product: 'Reception Desk', status: 'Hardware Installation', due: '2024-06-04' },
  ],
  'Quality Check': [
    { id: 'JOB-094', product: 'Executive Desk', status: 'Inspection', due: '2024-06-03' },
  ],
  'Shipping': [
    { id: 'JOB-090', product: 'Conference Table', status: 'Packaging', due: '2024-06-02' },
  ],
};

const bottleneckDetails = {
  'Production': {
    causes: [
      { reason: 'Machine Breakdown (CNC-02)', impact: 'High', frequency: 3 },
      { reason: 'Material Shortage (Steel Sheets)', impact: 'Medium', frequency: 2 },
    ],
    affectedJobs: ['JOB-098', 'JOB-099']
  },
  'Assembly': {
    causes: [
      { reason: 'Labor Shortage', impact: 'Medium', frequency: 4 },
    ],
    affectedJobs: ['JOB-095']
  }
};

const resourceDetails = {
  'Labor': [
    { name: 'Welding Team', utilization: 92, status: 'Overloaded' },
    { name: 'Assembly Team', utilization: 85, status: 'Optimal' },
    { name: 'Design Team', utilization: 60, status: 'Underutilized' },
  ],
  'Machinery': [
    { name: 'CNC Router', utilization: 95, status: 'Critical' },
    { name: 'Laser Cutter', utilization: 70, status: 'Optimal' },
    { name: 'Press Brake', utilization: 45, status: 'Underutilized' },
  ],
  'Materials': [
    { name: 'Steel Inventory', utilization: 88, status: 'Optimal' },
    { name: 'Wood Inventory', utilization: 95, status: 'Low Stock' },
  ],
  'Space': [
    { name: 'Assembly Area', utilization: 90, status: 'Congested' },
    { name: 'Warehouse', utilization: 50, status: 'Available' },
  ]
};

// Data-row shape for the main workflow stage analysis table/chart (wired to getPmReports)
interface StageAnalysisRow {
  stage: string;
  planned: number;
  actual: number;
  variance: number;
}

// Fallback stage analysis rows, used until live data loads.
const defaultStageAnalysisData: StageAnalysisRow[] = [
  { stage: 'Design', planned: 5, actual: 6, variance: 1 },
  { stage: 'Engineering', planned: 8, actual: 7, variance: -1 },
  { stage: 'Production', planned: 15, actual: 18, variance: 3 },
  { stage: 'Assembly', planned: 10, actual: 12, variance: 2 },
  { stage: 'Quality Check', planned: 4, actual: 5, variance: 1 },
  { stage: 'Shipping', planned: 3, actual: 3, variance: 0 },
];

const bottleneckData = [
  { stage: 'Production', delayHours: 48, impact: 'High' },
  { stage: 'Assembly', delayHours: 24, impact: 'Medium' },
  { stage: 'Engineering', delayHours: 12, impact: 'Low' },
  { stage: 'Design', delayHours: 8, impact: 'Low' },
  { stage: 'Quality Check', delayHours: 6, impact: 'Low' },
];

const throughputData = [
  { month: 'Jan', units: 120, target: 100 },
  { month: 'Feb', units: 135, target: 110 },
  { month: 'Mar', units: 110, target: 120 },
  { month: 'Apr', units: 150, target: 130 },
  { month: 'May', units: 165, target: 140 },
  { month: 'Jun', units: 180, target: 150 },
];

const resourceEfficiencyData = [
  { name: 'Labor', value: 85, color: '#0088FE' },
  { name: 'Machinery', value: 72, color: '#00C49F' },
  { name: 'Materials', value: 92, color: '#FFBB28' },
  { name: 'Space', value: 65, color: '#FF8042' },
];

const projectTimelineData = [
  { name: 'Project A', start: 0, duration: 15, status: 'Completed' },
  { name: 'Project B', start: 5, duration: 20, status: 'In Progress' },
  { name: 'Project C', start: 10, duration: 12, status: 'Delayed' },
  { name: 'Project D', start: 15, duration: 18, status: 'Planned' },
  { name: 'Project E', start: 20, duration: 25, status: 'Planned' },
];

export default function ManufacturingWorkflowReportPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('this-month');
  const [projectType, setProjectType] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stageAnalysisData, setStageAnalysisData] = useState<StageAnalysisRow[]>(defaultStageAnalysisData);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.getPmReports();
        const mapped: StageAnalysisRow[] = (raw || []).map((r: any) => {
          const planned = Number(r.planned ?? r.plannedDays ?? r.plannedDuration ?? 0);
          const actual = Number(r.actual ?? r.actualDays ?? r.actualDuration ?? 0);
          return {
            stage: r.stage ?? r.stageName ?? r.name ?? r.phase ?? '',
            planned,
            actual,
            variance: Number(r.variance ?? (actual - planned)),
          };
        });
        if (!cancelled) {
          // Only replace the fallback data when the endpoint actually returns rows,
          // so the chart still renders while the backend DB is unseeded.
          if (mapped.length > 0) setStageAnalysisData(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
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

  // Drill-down states
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedBottleneck, setSelectedBottleneck] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const handleStageClick = (data: any) => {
    if (data && data.activePayload) {
      setSelectedStage(data.activePayload[0].payload.stage);
    }
  };

  const handleBottleneckClick = (data: any) => {
    if (data && data.activePayload) {
      setSelectedBottleneck(data.activePayload[0].payload.stage);
    }
  };

  const handleResourceClick = (data: any) => {
    if (data && data.name) {
      setSelectedResource(data.name);
    }
  };

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
                <h1 className="text-xl font-bold text-gray-900">Manufacturing Workflow Analysis</h1>
                <p className="text-sm text-gray-500">Comprehensive insights into production stages, bottlenecks, and efficiency</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-6 pb-2">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={dateRange === 'this-month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('this-month')}
                className={dateRange === 'this-month' ? 'shadow-sm' : ''}
              >
                This Month
              </Button>
              <Button
                variant={dateRange === 'last-month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('last-month')}
                className={dateRange === 'last-month' ? 'shadow-sm' : ''}
              >
                Last Month
              </Button>
              <Button
                variant={dateRange === 'quarter' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('quarter')}
                className={dateRange === 'quarter' ? 'shadow-sm' : ''}
              >
                This Quarter
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Project Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="commercial">Commercial Kitchen</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="custom">Custom Fabrication</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <p className="text-sm font-medium text-gray-500">Avg. Cycle Time</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">14.2 Days</h3>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      -1.5 days vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Throughput Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">92%</h3>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +4% vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Factory className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Bottlenecks</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">2</h3>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Production Stage
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
                    <p className="text-sm font-medium text-gray-500">Resource Efficiency</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">78%</h3>
                    <p className="text-xs text-yellow-600 flex items-center mt-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Optimization needed
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Stage Analysis */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Workflow Stage Analysis (Days)</CardTitle>
                <CardDescription>Planned vs Actual time spent in each stage</CardDescription>
              </CardHeader>
              <CardContent>
                {loadError && (
                  <p className="text-xs text-red-600 mb-2">{loadError}</p>
                )}
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading stage analysis…</div>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stageAnalysisData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      onClick={handleStageClick}
                      className="cursor-pointer"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="stage" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="planned" name="Planned Days" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" name="Actual Days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Click on a stage to view active jobs</p>
              </CardContent>
            </Card>

            {/* Throughput Trends */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Production Throughput</CardTitle>
                <CardDescription>Monthly units produced vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={throughputData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="units" name="Actual Units" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUnits)" />
                      <Line type="monotone" dataKey="target" name="Target" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Bottleneck Radar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Top Bottlenecks</CardTitle>
                <CardDescription>Stages with highest average delay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bottleneckData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      onClick={handleBottleneckClick}
                      className="cursor-pointer"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="stage" type="category" width={80} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Bar dataKey="delayHours" name="Delay (Hours)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Click on a bar to view root causes</p>
              </CardContent>
            </Card>

            {/* Resource Efficiency */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Resource Efficiency</CardTitle>
                <CardDescription>Utilization rates by resource type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resourceEfficiencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        onClick={handleResourceClick}
                        className="cursor-pointer"
                      >
                        {resourceEfficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Click on a segment to view details</p>
              </CardContent>
            </Card>

            {/* Project Timeline Gantt-ish View */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Active Projects Timeline</CardTitle>
                <CardDescription>Current status and duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projectTimelineData.map((project, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{project.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${project.status === 'Completed' ? 'bg-green-500' :
                            project.status === 'Delayed' ? 'bg-red-500' :
                              project.status === 'In Progress' ? 'bg-blue-500' :
                                'bg-gray-400'
                            }`}
                          style={{
                            width: `${(project.duration / 30) * 100}%`,
                            marginLeft: `${(project.start / 30) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stage Details Modal */}
      <ModalWrapper
        isOpen={!!selectedStage}
        onClose={() => setSelectedStage(null)}
        title={`${selectedStage} Stage - Active Jobs`}
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedStage && stageDetails[selectedStage as keyof typeof stageDetails]?.map((job) => (
                <tr key={job.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{job.id}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{job.product}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{job.status}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{job.due}</td>
                </tr>
              )) || (
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-center text-sm text-gray-500">No active jobs in this stage</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </ModalWrapper>

      {/* Bottleneck Details Modal */}
      <ModalWrapper
        isOpen={!!selectedBottleneck}
        onClose={() => setSelectedBottleneck(null)}
        title={`${selectedBottleneck} Bottleneck Analysis`}
        size="md"
      >
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Root Causes</h4>
            <div className="space-y-3">
              {selectedBottleneck && bottleneckDetails[selectedBottleneck as keyof typeof bottleneckDetails]?.causes.map((cause, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-red-900">{cause.reason}</p>
                    <p className="text-xs text-red-600">Frequency: {cause.frequency} incidents</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    {cause.impact} Impact
                  </span>
                </div>
              )) || <p className="text-sm text-gray-500">No specific root causes identified.</p>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Affected Jobs</h4>
            <div className="flex flex-wrap gap-2">
              {selectedBottleneck && bottleneckDetails[selectedBottleneck as keyof typeof bottleneckDetails]?.affectedJobs.map((job) => (
                <span key={job} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {job}
                </span>
              )) || <p className="text-sm text-gray-500">No jobs currently affected.</p>}
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* Resource Details Modal */}
      <ModalWrapper
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        title={`${selectedResource} Utilization Details`}
        size="md"
      >
        <div className="space-y-2">
          {selectedResource && resourceDetails[selectedResource as keyof typeof resourceDetails]?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.utilization > 90 ? 'bg-red-500' :
                        item.utilization > 70 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      style={{ width: `${item.utilization}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{item.utilization}%</span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Critical' || item.status === 'Overloaded' ? 'bg-red-100 text-red-700' :
                item.status === 'Optimal' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                {item.status}
              </span>
            </div>
          )) || <p className="text-sm text-gray-500">No detailed data available.</p>}
        </div>
      </ModalWrapper>
    </div>
  );
}
