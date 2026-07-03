'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Package,
  Camera,
  FileText,
  Download,
  AlertCircle,
  Edit,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectManagementService, CabinetMarkingTask, Project } from '@/services/ProjectManagementService';

export default function CabinetMarkingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<CabinetMarkingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    projectName: '',
    cabinetType: '',
    quantity: '',
    assignedTeam: '',
  });

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      loadProjects();
    }
  }, [projectId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectManagementService.getProjects();
      setProjects(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load projects.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
      const [project, projectTasks] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getCabinetMarkingTasks(id)
      ]);
      setSelectedProject(project);
      setTasks(projectTasks);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/cabinet-marking');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTask = () => {
    if (!newTask.projectName || !newTask.cabinetType || !newTask.quantity || !newTask.assignedTeam) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields to schedule a task.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: CabinetMarkingTask = {
      id: Math.random().toString(36).substring(7),
      taskNumber: `CM-2025-${(tasks.length + 1).toString().padStart(3, '0')}`,
      projectId: projectId || 'PRJ-2025-NEW',
      projectName: selectedProject?.name || newTask.projectName,
      cabinetType: newTask.cabinetType,
      quantity: parseInt(newTask.quantity),
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedTeam: newTask.assignedTeam,
      status: 'Scheduled',
      completionPercentage: 0,
      markedItems: 0,
      totalItems: parseInt(newTask.quantity),
      photosUploaded: 0,
      reportGenerated: false,
    };

    setTasks([newEntry, ...tasks]);
    setIsScheduleOpen(false);
    setNewTask({ projectName: '', cabinetType: '', quantity: '', assignedTeam: '' });
    toast({
      title: "Task Scheduled",
      description: `${newEntry.taskNumber} has been scheduled successfully.`,
    });
  };

  const filteredTasks = tasks.filter(
    (t) => statusFilter === 'All' || t.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending Review':
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const stats = {
    total: tasks.length,
    scheduled: tasks.filter((t) => t.status === 'Scheduled').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    pendingReview: tasks.filter((t) => t.status === 'Pending Review').length,
    totalCabinets: tasks.reduce((sum, t) => sum + t.quantity, 0),
    markedCabinets: tasks.reduce((sum, t) => sum + t.markedItems, 0),
  };

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent px-3">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Cabinet Marking</h1>
            <p className="text-sm text-gray-500">Choose a project to coordinate cabinet labeling and inspection</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{project.projectCode}</Badge>
                    <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                  <CardDescription>{project.clientName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{project.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/project-management/cabinet-marking?projectId=${project.id}`)}
                  >
                    Manage Marking
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="px-3 py-2 space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/project-management/cabinet-marking')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cabinet Marking Management
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedProject?.name} • Step 2.9: Coordinate cabinet marking
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/project-management/cabinet-marking')}>
                Change Project
              </Button>
              <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Schedule Marking
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Schedule Marking Task</DialogTitle>
                    <DialogDescription>
                      Create a new cabinet marking task.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="project" className="text-right">
                        Project
                      </Label>
                      <Input
                        id="project"
                        value={selectedProject?.name || ''}
                        disabled
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Input
                        id="type"
                        value={newTask.cabinetType}
                        onChange={(e) => setNewTask({ ...newTask, cabinetType: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Wall Cabinets"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newTask.quantity}
                        onChange={(e) => setNewTask({ ...newTask, quantity: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="team" className="text-right">
                        Team
                      </Label>
                      <Input
                        id="team"
                        value={newTask.assignedTeam}
                        onChange={(e) => setNewTask({ ...newTask, assignedTeam: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Team A"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleScheduleTask}>Schedule Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading details...</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Cabinets Marked</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.markedCabinets}/{stats.totalCabinets}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Progress */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Overall Marking Progress</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalCabinets > 0 ? Math.round((stats.markedCabinets / stats.totalCabinets) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${stats.totalCabinets > 0 ? (stats.markedCabinets / stats.totalCabinets) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.markedCabinets} of {stats.totalCabinets} cabinets marked for this project
              </p>
            </Card>

            {/* Filter */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </Card>

            {/* Marking Tasks List */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-2 border-b">
                <CardTitle className="text-lg">Cabinet Marking Tasks</CardTitle>
              </CardHeader>
              <div className="divide-y divide-gray-200">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No marking tasks found for this project.
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusIcon(task.status)}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.taskNumber} - {task.cabinetType}
                              </h3>
                              <p className="text-sm text-gray-600">{task.projectName}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                            <div>
                              <p className="text-xs text-gray-500">Scheduled Date</p>
                              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {task.scheduledDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Quantity</p>
                              <p className="text-sm font-medium text-gray-900">{task.quantity} cabinets</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Assigned Team</p>
                              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {task.assignedTeam}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Photos</p>
                              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {task.photosUploaded} uploaded
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Marking Progress</span>
                              <span className="font-medium text-gray-900">
                                {task.markedItems}/{task.totalItems} items marked ({task.completionPercentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${task.completionPercentage === 100
                                  ? 'bg-green-600'
                                  : task.completionPercentage > 0
                                    ? 'bg-yellow-600'
                                    : 'bg-gray-400'
                                  }`}
                                style={{ width: `${task.completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col items-end gap-3">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast({ title: "Edit Task", description: `Editing task ${task.taskNumber}` })}
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <FileText className="w-4 h-4 text-gray-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Marking Checklist</DialogTitle>
                                  <DialogDescription>Standard procedure for cabinet marking.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2">
                                  {[
                                    "Verify cabinet dimensions against drawings",
                                    "Check for surface defects or damage",
                                    "Apply identification label to visible surface",
                                    "Mark installation height and position",
                                    "Photograph marked cabinet",
                                    "Update tracking sheet"
                                  ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border border-gray-300" />
                                      <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                  ))}
                                </div>
                                <DialogFooter>
                                  <Button onClick={() => setIsChecklistOpen(false)}>Close</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            {task.reportGenerated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => toast({ title: "Download Report", description: "Downloading marking report..." })}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">About Cabinet Marking</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Step 2.9: Schedule and execute cabinet marking tasks before installation.
                    Teams mark cabinets with identifying labels, take photos for documentation, and
                    generate marking reports for the installation team.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
